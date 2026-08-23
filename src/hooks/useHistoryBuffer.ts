import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseHistoryBufferOptions<T> {
	value?: T
	defaultValue: T
	onChange?: (value: T) => void
	maxSize?: number
	commitOnDelimiter?: boolean
}

export interface UseHistoryBufferResult<T> {
	value: T
	setValue: (value: T) => void
	commit: () => void
	undo: () => void
	redo: () => void
	canUndo: boolean
	canRedo: boolean
	reset: (value: T) => void
}

const DEFAULT_DELIMITER = /[\s.,!?;:()[\]{}'"`«»„“—–-]$/u
const DEFAULT_HISTORY_SIZE = 100

const endsWithDelimiter = (value: string): boolean =>
	DEFAULT_DELIMITER.test(value)

const reachedDelimiter = (
	previousValue: string,
	nextValue: string
): boolean => {
	if (!nextValue || !endsWithDelimiter(nextValue)) return false
	return !endsWithDelimiter(previousValue)
}

/**
 * History buffer с группировкой строкового ввода по логическим блокам.
 * Пока пользователь печатает слово, значение обновляется локально,
 * но новая history entry появляется только после delimiter.
 */
export function useHistoryBuffer<T>({
	value: controlledValue,
	defaultValue,
	onChange,
	maxSize = DEFAULT_HISTORY_SIZE,
	commitOnDelimiter = true
}: UseHistoryBufferOptions<T>): UseHistoryBufferResult<T> {
	const isControlled = controlledValue !== undefined
	const historyLimit = Math.max(1, Math.floor(maxSize))

	const [internalValue, setInternalValue] = useState(defaultValue)
	const currentValue = controlledValue !== undefined ? controlledValue : internalValue

	const pastRef = useRef<T[]>([])
	const futureRef = useRef<T[]>([])
	const committedValueRef = useRef<T>(currentValue)
	const localValueRef = useRef<T>(currentValue)
	const hasPendingChangesRef = useRef(false)

	const [historyState, setHistoryState] = useState({
		canUndo: false,
		canRedo: false
	})

	const syncHistoryState = useCallback(() => {
		setHistoryState({
			canUndo: pastRef.current.length > 0,
			canRedo: futureRef.current.length > 0
		})
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

	useEffect(() => {
		if (!isControlled || controlledValue === undefined) return
		if (Object.is(controlledValue, localValueRef.current)) return

		pastRef.current = []
		futureRef.current = []
		committedValueRef.current = controlledValue
		localValueRef.current = controlledValue
		hasPendingChangesRef.current = false
		syncHistoryState()
	}, [controlledValue, isControlled, syncHistoryState])

	const pushHistory = useCallback(
		(state: T) => {
			const history = pastRef.current
			const last = history[history.length - 1]

			if (last !== undefined && Object.is(last, state)) return

			pastRef.current = [...history, state].slice(-historyLimit)
		},
		[historyLimit]
	)

	const commit = useCallback(() => {
		const current = localValueRef.current
		const committed = committedValueRef.current

		if (Object.is(current, committed)) {
			hasPendingChangesRef.current = false
			syncHistoryState()
			return
		}

		pushHistory(committed)
		committedValueRef.current = current
		hasPendingChangesRef.current = false
		futureRef.current = []
		syncHistoryState()
	}, [pushHistory, syncHistoryState])

	const setValue = useCallback(
		(nextValue: T) => {
			const previousValue = localValueRef.current

			if (Object.is(previousValue, nextValue)) return

		emit(nextValue)

			if (
				!commitOnDelimiter ||
				typeof previousValue !== 'string' ||
				typeof nextValue !== 'string'
			) {
				hasPendingChangesRef.current = true
				futureRef.current = []
				syncHistoryState()
				return
			}

			if (reachedDelimiter(previousValue, nextValue)) {
				pushHistory(committedValueRef.current)
				committedValueRef.current = nextValue
				hasPendingChangesRef.current = false
				futureRef.current = []
			} else {
				hasPendingChangesRef.current = true
			}

			syncHistoryState()
		},
		[commitOnDelimiter, emit, pushHistory, syncHistoryState]
	)

	const undo = useCallback(() => {
		const current = localValueRef.current

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
				syncHistoryState()
				return
			}

			hasPendingChangesRef.current = false
		}

		const previous = pastRef.current[pastRef.current.length - 1]
		if (previous === undefined) {
			syncHistoryState()
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
		syncHistoryState()
	}, [emit, historyLimit, syncHistoryState])

	const redo = useCallback(() => {
		const next = futureRef.current[0]
		if (next === undefined) {
			syncHistoryState()
			return
		}

		const current = localValueRef.current
		futureRef.current = futureRef.current.slice(1)
		pastRef.current = [...pastRef.current, current].slice(-historyLimit)
		committedValueRef.current = next
		localValueRef.current = next
		hasPendingChangesRef.current = false

		emit(next)
		syncHistoryState()
	}, [emit, historyLimit, syncHistoryState])

	const reset = useCallback(
		(nextValue: T) => {
			pastRef.current = []
			futureRef.current = []
			committedValueRef.current = nextValue
			localValueRef.current = nextValue
			hasPendingChangesRef.current = false

			emit(nextValue)
			syncHistoryState()
		},
		[emit, syncHistoryState]
	)

	return {
		value: currentValue,
		setValue,
		commit,
		undo,
		redo,
		canUndo: historyState.canUndo,
		canRedo: historyState.canRedo,
		reset
	}
}
