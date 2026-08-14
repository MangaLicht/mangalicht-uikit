import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseHistoryBufferOptions<T> {
	value?: T
	defaultValue: T
	onChange?: (value: T) => void
	maxSize?: number

	/**
	 * Для строк history boundary создаётся после завершения
	 * логического блока:
	 *
	 * - пробел;
	 * - Enter;
	 * - знак препинания;
	 * - закрывающий разделитель.
	 */
	commitOnDelimiter?: boolean
}

export interface UseHistoryBufferResult<T> {
	value: T

	/**
	 * Изменить текущее значение.
	 *
	 * Последовательные изменения внутри одного логического
	 * блока не создают отдельные history entries.
	 */
	setValue: (value: T) => void

	/**
	 * Принудительно завершить текущий логический блок.
	 *
	 * Используется для действий, которые не являются обычным
	 * вводом текста: Markdown formatting, paste actions и т.д.
	 */
	commit: () => void

	undo: () => void
	redo: () => void

	canUndo: boolean
	canRedo: boolean

	reset: (value: T) => void
}

const DEFAULT_DELIMITER = /[\s.,!?;:()[\]{}'"`«»„“—–-]$/u

const MAX_HISTORY_SIZE = 1

/**
 * Проверяет, является ли значение завершённым логическим блоком.
 */
const endsWithDelimiter = (value: string): boolean => {
	return DEFAULT_DELIMITER.test(value)
}

/**
 * Определяет момент перехода через history boundary.
 *
 * Важно:
 *
 * "hello"
 * "hello "
 *
 * -> commit
 *
 * Но:
 *
 * "hello "
 * "hello  "
 *
 * -> новый commit не создаём.
 *
 * Это предотвращает появление пустых промежуточных history entries
 * при нескольких пробелах подряд.
 */
const reachedDelimiter = (
	previousValue: string,
	nextValue: string
): boolean => {
	if (!nextValue || !endsWithDelimiter(nextValue)) {
		return false
	}

	return !endsWithDelimiter(previousValue)
}

/**
 * History buffer с группировкой пользовательского ввода.
 *
 * Пример:
 *
 * "" → "H" → "He" → "Hel" → "Hell" → "Hello"
 *
 * history:
 * []
 *
 * После пробела:
 *
 * "Hello "
 *
 * history:
 * [""]
 *
 * После второго слова:
 *
 * "Hello world "
 *
 * history:
 * ["", "Hello "]
 *
 * Undo:
 *
 * "Hello world " → "Hello "
 *
 * Следующий Undo:
 *
 * "Hello " → ""
 */
export function useHistoryBuffer<T>({
	value: controlledValue,
	defaultValue,
	onChange,
	maxSize = 100,
	commitOnDelimiter = true
}: UseHistoryBufferOptions<T>): UseHistoryBufferResult<T> {
	const isControlled = controlledValue !== undefined
	const historyLimit = Math.max(MAX_HISTORY_SIZE, maxSize)

	const [internalValue, setInternalValue] = useState(defaultValue)

	const currentValue = isControlled ? controlledValue : internalValue

	const pastRef = useRef<T[]>([])
	const futureRef = useRef<T[]>([])

	/**
	 * Последнее состояние, которое является history boundary.
	 */
	const committedValueRef = useRef<T>(currentValue)

	/**
	 * Последнее фактически отображаемое значение.
	 */
	const localValueRef = useRef<T>(currentValue)

	/**
	 * Есть ли незавершённый пользовательский ввод.
	 *
	 * Например:
	 *
	 * committed = "Hello "
	 * current   = "Hello world"
	 *
	 * pending = true
	 */
	const hasPendingChangesRef = useRef(false)

	const [, forceHistoryUpdate] = useState(0)

	const notifyHistoryChange = useCallback(() => {
		forceHistoryUpdate(value => value + 1)
	}, [])

	const emit = useCallback(
		(nextValue: T) => {
			localValueRef.current = nextValue

			if (!isControlled) {
				setInternalValue(nextValue)
			}

			onChange?.(nextValue)
		},
		[isControlled, onChange]
	)

	/**
	 * Синхронизация controlled value.
	 *
	 * Если изменение пришло извне, а не через setValue(),
	 * оно считается новой исходной точкой history.
	 */
	useEffect(() => {
		if (!isControlled || controlledValue === undefined) {
			return
		}

		if (Object.is(controlledValue, localValueRef.current)) {
			return
		}

		pastRef.current = []
		futureRef.current = []

		committedValueRef.current = controlledValue
		localValueRef.current = controlledValue
		hasPendingChangesRef.current = false

		notifyHistoryChange()
	}, [controlledValue, isControlled, notifyHistoryChange])

	const pushHistory = useCallback(
		(state: T) => {
			const history = pastRef.current

			const last = history[history.length - 1]

			if (last !== undefined && Object.is(last, state)) {
				return
			}

			pastRef.current = [...history, state].slice(-historyLimit)
		},
		[historyLimit]
	)

	/**
	 * Завершает текущий логический блок.
	 *
	 * В history помещается состояние ДО блока.
	 */
	const commit = useCallback(() => {
		const current = localValueRef.current
		const committed = committedValueRef.current

		if (Object.is(current, committed)) {
			hasPendingChangesRef.current = false
			return
		}

		pushHistory(committed)

		committedValueRef.current = current
		hasPendingChangesRef.current = false

		/**
		 * Любое новое логическое изменение инвалидирует Redo.
		 */
		futureRef.current = []

		notifyHistoryChange()
	}, [notifyHistoryChange, pushHistory])

	const setValue = useCallback(
		(nextValue: T) => {
			const previousValue = localValueRef.current

			if (Object.is(previousValue, nextValue)) {
				return
			}

			emit(nextValue)

			/**
			 * Для нестроковых значений history boundary
			 * создаётся только явно через commit().
			 */
			if (
				!commitOnDelimiter ||
				typeof previousValue !== 'string' ||
				typeof nextValue !== 'string'
			) {
				hasPendingChangesRef.current = true
				futureRef.current = []
				notifyHistoryChange()
				return
			}

			const isBoundary = reachedDelimiter(previousValue, nextValue)

			if (isBoundary) {
				/**
				 * Записываем состояние ДО завершённого блока.
				 */
				pushHistory(committedValueRef.current)

				committedValueRef.current = nextValue
				hasPendingChangesRef.current = false

				futureRef.current = []
			} else {
				/**
				 * Пока пользователь находится внутри слова
				 * history не изменяется.
				 */
				hasPendingChangesRef.current = true
			}

			notifyHistoryChange()
		},
		[commitOnDelimiter, emit, notifyHistoryChange, pushHistory]
	)

	const undo = useCallback(() => {
		const current = localValueRef.current

		/**
		 * Сначала отменяем незавершённый блок.
		 *
		 * Например:
		 *
		 * committed = "Hello "
		 * current = "Hello world"
		 *
		 * Ctrl+Z:
		 *
		 * "Hello world" → "Hello "
		 */
		if (hasPendingChangesRef.current) {
			const committed = committedValueRef.current

			if (!Object.is(current, committed)) {
				futureRef.current = [current, ...futureRef.current].slice(
					0,
					historyLimit
				)

				emit(committed)

				localValueRef.current = committed
				hasPendingChangesRef.current = false

				notifyHistoryChange()
				return
			}

			hasPendingChangesRef.current = false
		}

		const previous = pastRef.current[pastRef.current.length - 1]

		if (previous === undefined) {
			return
		}

		pastRef.current = pastRef.current.slice(0, -1)

		futureRef.current = [current, ...futureRef.current].slice(
			0,
			historyLimit
		)

		committedValueRef.current = previous
		localValueRef.current = previous
		hasPendingChangesRef.current = false

		emit(previous)
		notifyHistoryChange()
	}, [emit, historyLimit, notifyHistoryChange])

	const redo = useCallback(() => {
		const next = futureRef.current[0]

		if (next === undefined) {
			return
		}

		const current = localValueRef.current

		futureRef.current = futureRef.current.slice(1)

		pastRef.current = [...pastRef.current, current].slice(-historyLimit)

		committedValueRef.current = next
		localValueRef.current = next
		hasPendingChangesRef.current = false

		emit(next)
		notifyHistoryChange()
	}, [emit, historyLimit, notifyHistoryChange])

	const reset = useCallback(
		(nextValue: T) => {
			pastRef.current = []
			futureRef.current = []

			committedValueRef.current = nextValue
			localValueRef.current = nextValue
			hasPendingChangesRef.current = false

			emit(nextValue)
			notifyHistoryChange()
		},
		[emit, notifyHistoryChange]
	)

	return {
		value: currentValue,
		setValue,
		commit,
		undo,
		redo,
		canUndo: pastRef.current.length > 0,
		canRedo: futureRef.current.length > 0,
		reset
	}
}
