import {
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type MouseEvent as ReactMouseEvent,
	type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'

import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea'
import { useHistoryBuffer } from '@/hooks/useHistoryBuffer'
import { useSmoothFollow } from '@/hooks/useSmoothFollow'

import { UndoIcon } from '@/icons/Undo'
import { RedoIcon } from '@/icons/Redo'
import { EyeIcon } from '@/icons/Markdown'

import styles from './MarkdownField.module.scss'

export type MarkdownToolbarAction =
	| 'bold'
	| 'italic'
	| 'strike'
	| 'code'
	| 'spoiler'
	| 'link'
	| 'quote'
	| 'unordered-list'
	| 'ordered-list'

export interface MarkdownInputProps {
	value?: string
	defaultValue?: string
	onChange?: (value: string) => void
	placeholder?: string
	disabled?: boolean
	readOnly?: boolean
	minRows?: number
	maxRows?: number
	historySize?: number
	maxLength?: number
	className?: string
	textareaClassName?: string
	children?: ReactNode
	onToolbarAction?: (action: MarkdownToolbarAction) => void
}

interface SelectionRect {
	x: number
	y: number
	width: number
	height: number
}

interface SelectionRange {
	start: number
	end: number
}

interface FloatingToolbarProps {
	selectionRect: SelectionRect | null
	canUndo: boolean
	canRedo: boolean
	disabled: boolean
	onUndo: () => void
	onRedo: () => void
	onAction: (action: MarkdownToolbarAction) => void
}

/**
 * Получает приблизительный bounding rect выделения внутри textarea.
 *
 * Для textarea используется mirror-element, поскольку обычный
 * Selection API не работает с текстовым содержимым textarea.
 */
const getSelectionRect = (
	textarea: HTMLTextAreaElement
): SelectionRect | null => {
	const start = textarea.selectionStart
	const end = textarea.selectionEnd

	if (start === end) {
		return null
	}

	const value = textarea.value
	const computed = window.getComputedStyle(textarea)

	const mirror = document.createElement('div')
	const marker = document.createElement('span')

	mirror.setAttribute('aria-hidden', 'true')

	Object.assign(mirror.style, {
		position: 'fixed',
		visibility: 'hidden',
		pointerEvents: 'none',
		left: '0',
		top: '0',
		width: `${textarea.clientWidth}px`,
		height: `${textarea.clientHeight}px`,
		whiteSpace: 'pre-wrap',
		overflowWrap: 'break-word',
		boxSizing: computed.boxSizing,
		fontFamily: computed.fontFamily,
		fontSize: computed.fontSize,
		fontWeight: computed.fontWeight,
		fontStyle: computed.fontStyle,
		lineHeight: computed.lineHeight,
		letterSpacing: computed.letterSpacing,
		wordSpacing: computed.wordSpacing,
		textTransform: computed.textTransform,
		textIndent: computed.textIndent,
		padding: computed.padding,
		border: computed.border,
		tabSize: computed.tabSize
	})

	const before = document.createTextNode(value.slice(0, start))

	const selected = value.slice(start, end)

	const after = document.createTextNode(value.slice(end))

	marker.textContent = selected || '\u200b'

	mirror.appendChild(before)
	mirror.appendChild(marker)
	mirror.appendChild(after)

	document.body.appendChild(mirror)

	const mirrorRect = mirror.getBoundingClientRect()
	const markerRect = marker.getBoundingClientRect()
	const textareaRect = textarea.getBoundingClientRect()

	/**
	 * Важно учитывать внутренний scroll textarea.
	 *
	 * Без этого toolbar постепенно уезжает при вертикальном
	 * или горизонтальном scroll.
	 */
	const x =
		textareaRect.left +
		markerRect.left -
		mirrorRect.left -
		textarea.scrollLeft

	const y =
		textareaRect.top + markerRect.top - mirrorRect.top - textarea.scrollTop

	const rect: SelectionRect = {
		x,
		y,
		width: Math.max(markerRect.width, 1),
		height: Math.max(
			markerRect.height,
			parseFloat(computed.lineHeight) || 20
		)
	}

	mirror.remove()

	return rect
}

/**
 * Floating Markdown toolbar.
 *
 * Важно:
 * - selection не теряется при клике;
 * - позиция плавно следует за новым selectionRect;
 * - первый кадр телепортируется в правильную позицию;
 * - последующие изменения идут через useSmoothFollow.
 */
const FloatingToolbar = memo(
	({
		selectionRect,
		canUndo,
		canRedo,
		disabled,
		onUndo,
		onRedo,
		onAction
	}: FloatingToolbarProps) => {
		const toolbarRef = useRef<HTMLDivElement>(null)

		const [positioned, setPositioned] = useState(false)

		const applyPosition = useCallback(
			(element: HTMLDivElement, x: number, y: number) => {
				element.style.left = `${Math.round(x)}px`
				element.style.top = `${Math.round(y)}px`
			},
			[]
		)

		const { elementRef, setTarget } = useSmoothFollow<HTMLDivElement>(
			applyPosition,
			{
				lag: 90,
				enabled: Boolean(selectionRect) && !disabled
			}
		)

		/**
		 * Рассчитываем новую target position только после того,
		 * как toolbar реально присутствует в DOM.
		 */
		useLayoutEffect(() => {
			const toolbar = toolbarRef.current

			if (!toolbar || !selectionRect || disabled) {
				return
			}

			let cancelled = false

			const updatePosition = async () => {
				/**
				 * Даём браузеру закончить текущий layout pass.
				 */
				await new Promise<void>(resolve => {
					requestAnimationFrame(() => resolve())
				})

				if (cancelled) return

				const reference = {
					getBoundingClientRect: () => ({
						x: selectionRect.x,
						y: selectionRect.y,
						top: selectionRect.y,
						left: selectionRect.x,
						right: selectionRect.x + selectionRect.width,
						bottom: selectionRect.y + selectionRect.height,
						width: selectionRect.width,
						height: selectionRect.height
					})
				}

				const { x, y } = await computePosition(reference, toolbar, {
					strategy: 'fixed',
					placement: 'top',
					middleware: [
						offset(8),
						flip({
							padding: 8
						}),
						shift({
							padding: 8
						})
					]
				})

				if (cancelled) return

				/**
				 * При первом появлении не заставляем toolbar
				 * "догонять" старую позицию.
				 */
				setTarget(x, y, {
					teleport: !positioned
				})

				setPositioned(true)
			}

			void updatePosition()

			return () => {
				cancelled = true
			}
		}, [positioned, selectionRect, setTarget, disabled])

		/**
		 * Новый selection должен начинать новый плавный
		 * target, но не скрывать toolbar.
		 */
		useEffect(() => {
			if (!selectionRect) {
				setPositioned(false)
			}
		}, [selectionRect])

		if (!selectionRect || disabled) {
			return null
		}

		/**
		 * Критически важно:
		 *
		 * preventDefault()
		 *   -> textarea не теряет focus;
		 *
		 * stopPropagation()
		 *   -> document-level mousedown в MarkdownInput
		 *      не воспринимает кнопку как клик вне textarea.
		 */
		const preventSelectionLoss = (event: ReactMouseEvent) => {
			event.preventDefault()
			event.stopPropagation()
		}

		const handleToolbarMouseDown = (event: ReactMouseEvent) => {
			event.preventDefault()
			event.stopPropagation()
		}

		const toolbar = (
			<div
				ref={node => {
					toolbarRef.current = node
					elementRef.current = node
				}}
				className={styles.toolbar}
				role='toolbar'
				aria-label='Markdown formatting toolbar'
				onMouseDown={handleToolbarMouseDown}
				style={{
					position: 'fixed',
					visibility: positioned ? 'visible' : 'hidden',
					willChange: 'left, top'
				}}
			>
				<button
					type='button'
					className={styles.toolbarButton}
					disabled={!canUndo}
					aria-label='Отменить'
					title='Отменить — Ctrl/Cmd + Z'
					onMouseDown={preventSelectionLoss}
					onClick={onUndo}
				>
					<UndoIcon />
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					disabled={!canRedo}
					aria-label='Повторить'
					title='Повторить — Ctrl/Cmd + Shift + Z'
					onMouseDown={preventSelectionLoss}
					onClick={onRedo}
				>
					<RedoIcon />
				</button>

				<span className={styles.toolbarDivider} />

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Жирный'
					title='Жирный'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('bold')}
				>
					<strong>B</strong>
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Курсив'
					title='Курсив'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('italic')}
				>
					<em>I</em>
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Зачёркнутый'
					title='Зачёркнутый'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('strike')}
				>
					<s>S</s>
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Код'
					title='Код'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('code')}
				>
					<code>{'</>'}</code>
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Спойлер'
					title='Спойлер'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('spoiler')}
				>
					<EyeIcon />
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Ссылка'
					title='Ссылка'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('link')}
				>
					🔗
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Цитата'
					title='Цитата'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('quote')}
				>
					❝
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Маркированный список'
					title='Маркированный список'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('unordered-list')}
				>
					•
				</button>

				<button
					type='button'
					className={styles.toolbarButton}
					aria-label='Нумерованный список'
					title='Нумерованный список'
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('ordered-list')}
				>
					1.
				</button>
			</div>
		)

		return createPortal(toolbar, document.body)
	}
)

FloatingToolbar.displayName = 'FloatingToolbar'

/**
 * Применяет Markdown-синтаксис к выделенному тексту.
 */
const applyMarkdownAction = (
	value: string,
	start: number,
	end: number,
	action: MarkdownToolbarAction
) => {
	const selected = value.slice(start, end)

	let replacement = selected

	switch (action) {
		case 'bold':
			replacement = `**${selected}**`
			break

		case 'italic':
			replacement = `*${selected}*`
			break

		case 'strike':
			replacement = `~~${selected}~~`
			break

		case 'code':
			replacement = `\`${selected}\``
			break

		case 'spoiler':
			replacement = `[spoiler]${selected}[/spoiler]`
			break

		case 'link':
			replacement = `[${selected}](url)`
			break

		case 'quote':
			replacement = selected
				.split('\n')
				.map(line => `> ${line}`)
				.join('\n')
			break

		case 'unordered-list':
			replacement = selected
				.split('\n')
				.map(line => `- ${line}`)
				.join('\n')
			break

		case 'ordered-list':
			replacement = selected
				.split('\n')
				.map((line, index) => `${index + 1}. ${line}`)
				.join('\n')
			break
	}

	return {
		value: value.slice(0, start) + replacement + value.slice(end),

		selectionStart: start,

		selectionEnd: start + replacement.length
	}
}

export const MarkdownInput = memo(
	({
		value: controlledValue,
		defaultValue = '',
		onChange,
		placeholder,
		disabled = false,
		readOnly = false,
		minRows = 3,
		maxRows = 15,
		historySize = 100,
		maxLength,
		className,
		textareaClassName,
		children,
		onToolbarAction
	}: MarkdownInputProps) => {
		const textareaRef = useRef<HTMLTextAreaElement>(null)

		/**
		 * Последнее актуальное выделение.
		 *
		 * Не полагаемся на selectionStart/selectionEnd
		 * после клика по floating toolbar.
		 */
		const selectionRef = useRef<SelectionRange | null>(null)

		const [selectionRect, setSelectionRect] =
			useState<SelectionRect | null>(null)

		const history = useHistoryBuffer<string>({
			value: controlledValue,
			defaultValue,
			onChange,
			maxSize: historySize
		})

		useAutosizeTextarea(textareaRef, history.value, {
			minRows,
			maxRows
		})

		const updateSelection = useCallback(() => {
			const textarea = textareaRef.current

			if (!textarea) return

			const start = textarea.selectionStart

			const end = textarea.selectionEnd

			if (start === end) {
				selectionRef.current = null
				setSelectionRect(null)
				return
			}

			selectionRef.current = {
				start,
				end
			}

			const rect = getSelectionRect(textarea)

			setSelectionRect(rect)
		}, [])

		/**
		 * Слежение за выделением текста.
		 */
		useEffect(() => {
			const textarea = textareaRef.current

			if (!textarea) return

			let isSelecting = false
			let rafId: number | null = null

			const scheduleUpdate = () => {
				if (rafId !== null) return

				rafId = requestAnimationFrame(() => {
					rafId = null
					updateSelection()
				})
			}

			const handleMouseDown = () => {
				isSelecting = true
			}

			const handleMouseMove = () => {
				if (!isSelecting) return
				scheduleUpdate()
			}

			const handleMouseUp = () => {
				if (!isSelecting) return

				isSelecting = false
				updateSelection()
			}

			const handleSelection = () => {
				scheduleUpdate()
			}

			textarea.addEventListener('mousedown', handleMouseDown)

			textarea.addEventListener('select', handleSelection)

			textarea.addEventListener('keyup', handleSelection)

			textarea.addEventListener('scroll', handleSelection)

			document.addEventListener('mousemove', handleMouseMove)

			document.addEventListener('mouseup', handleMouseUp)

			return () => {
				textarea.removeEventListener('mousedown', handleMouseDown)

				textarea.removeEventListener('select', handleSelection)

				textarea.removeEventListener('keyup', handleSelection)

				textarea.removeEventListener('scroll', handleSelection)

				document.removeEventListener('mousemove', handleMouseMove)

				document.removeEventListener('mouseup', handleMouseUp)

				if (rafId !== null) {
					cancelAnimationFrame(rafId)
				}
			}
		}, [updateSelection])

		/**
		 * selectionchange используется только для синхронизации.
		 *
		 * Не скрываем toolbar автоматически на любом document-level
		 * событии — toolbar сам контролирует валидность selection.
		 */
		useEffect(() => {
			const handleSelectionChange = () => {
				const textarea = textareaRef.current

				if (!textarea) return

				if (document.activeElement !== textarea) {
					return
				}

				updateSelection()
			}

			document.addEventListener('selectionchange', handleSelectionChange)

			return () => {
				document.removeEventListener(
					'selectionchange',
					handleSelectionChange
				)
			}
		}, [updateSelection])

		/**
		 * Клик вне textarea и toolbar действительно закрывает toolbar.
		 *
		 * Раньше здесь toolbar считался внешним элементом,
		 * из-за чего он исчезал на mousedown ещё до onClick.
		 */
		useEffect(() => {
			const handleMouseDown = (event: globalThis.MouseEvent) => {
				const target = event.target

				if (
					target instanceof Element &&
					target.closest('[role="toolbar"]')
				) {
					return
				}

				const textarea = textareaRef.current

				if (!textarea) return

				if (target instanceof Node && textarea.contains(target)) {
					return
				}

				selectionRef.current = null

				setSelectionRect(null)
			}

			document.addEventListener('mousedown', handleMouseDown)

			return () => {
				document.removeEventListener('mousedown', handleMouseDown)
			}
		}, [])

		/**
		 * Keyboard Undo / Redo.
		 */
		useEffect(() => {
			const textarea = textareaRef.current

			if (!textarea) return

			const handleKeyDown = (event: KeyboardEvent) => {
				const modifier = event.ctrlKey || event.metaKey

				if (!modifier) return

				if (event.key.toLowerCase() !== 'z') {
					return
				}

				event.preventDefault()

				if (event.shiftKey) {
					history.redo()
				} else {
					history.undo()
				}

				selectionRef.current = null

				setSelectionRect(null)

				requestAnimationFrame(() => {
					textarea.focus()
				})
			}

			textarea.addEventListener('keydown', handleKeyDown)

			return () => {
				textarea.removeEventListener('keydown', handleKeyDown)
			}
		}, [history.undo, history.redo])

		const handleChange = useCallback(
			(event: React.ChangeEvent<HTMLTextAreaElement>) => {
				history.setValue(event.target.value)

				requestAnimationFrame(() => {
					updateSelection()
				})
			},
			[history.setValue, updateSelection]
		)

		const handleUndo = useCallback(() => {
			if (!history.canUndo) {
				return
			}

			history.undo()

			selectionRef.current = null

			setSelectionRect(null)

			requestAnimationFrame(() => {
				textareaRef.current?.focus()
			})
		}, [history.canUndo, history.undo])

		const handleRedo = useCallback(() => {
			if (!history.canRedo) {
				return
			}

			history.redo()

			selectionRef.current = null

			setSelectionRect(null)

			requestAnimationFrame(() => {
				textareaRef.current?.focus()
			})
		}, [history.canRedo, history.redo])

		/**
		 * Markdown formatting.
		 *
		 * Берём selection из selectionRef, а не из DOM:
		 * это гарантирует, что click по toolbar не потеряет
		 * исходный диапазон.
		 */
		const handleToolbarAction = useCallback(
			(action: MarkdownToolbarAction) => {
				const textarea = textareaRef.current

				const selection = selectionRef.current

				if (!textarea || !selection || disabled || readOnly) {
					return
				}

				const { start, end } = selection

				if (start === end) {
					return
				}

				const result = applyMarkdownAction(
					history.value,
					start,
					end,
					action
				)

				/**
				 * Formatting — отдельное логическое действие.
				 * Поэтому сначала фиксируем незавершённый ввод,
				 * затем записываем результат форматирования
				 * как новый history boundary.
				 */
				history.commit()

				history.setValue(result.value)

				history.commit()

				onToolbarAction?.(action)

				const newSelection = {
					start: result.selectionStart,
					end: result.selectionEnd
				}

				selectionRef.current = newSelection

				/**
				 * Не скрываем toolbar.
				 *
				 * После обновления React возвращает новое
				 * значение textarea, затем восстанавливаем
				 * selection и пересчитываем его позицию.
				 */
				requestAnimationFrame(() => {
					const currentTextarea = textareaRef.current

					if (!currentTextarea) {
						return
					}

					currentTextarea.focus()

					currentTextarea.setSelectionRange(
						newSelection.start,
						newSelection.end
					)

					updateSelection()
				})
			},
			[disabled, history, onToolbarAction, readOnly, updateSelection]
		)

		const containerClassName = [styles.container, className]
			.filter(Boolean)
			.join(' ')

		const textareaClassNameValue = [styles.textarea, textareaClassName]
			.filter(Boolean)
			.join(' ')

		return (
			<div className={containerClassName}>
				<FloatingToolbar
					selectionRect={selectionRect}
					canUndo={Boolean(history.canUndo)}
					canRedo={Boolean(history.canRedo)}
					disabled={disabled || readOnly}
					onUndo={handleUndo}
					onRedo={handleRedo}
					onAction={handleToolbarAction}
				/>

				<textarea
					ref={textareaRef}
					className={textareaClassNameValue}
					value={history.value}
					placeholder={placeholder}
					disabled={disabled}
					readOnly={readOnly}
					maxLength={maxLength}
					rows={minRows}
					onChange={handleChange}
				/>

				{children}
			</div>
		)
	}
)

MarkdownInput.displayName = 'MarkdownInput'
