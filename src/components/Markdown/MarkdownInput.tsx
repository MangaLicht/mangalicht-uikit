import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	type FocusEvent,
	type TextareaHTMLAttributes
} from 'react'
import { createPortal } from 'react-dom'
import { computePosition, flip, offset, shift } from '@floating-ui/dom'

import { useAutosizeTextarea } from '@/hooks/useAutosizeTextarea'
import { useHistoryBuffer } from '@/hooks/useHistoryBuffer'
import { useSmoothFollow } from '@/hooks/useSmoothFollow'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import { measureTextareaSelection, type SelectionAnchorRect } from '@shared/utils/measureSelection'
import { getPortalRoot } from '@shared/utils/portalRoot'

import {
	Bold,
	Code2,
	Eye,
	Italic,
	Link2,
	List,
	ListOrdered,
	Quote,
	Strikethrough,
} from 'lucide-react'

import { Button } from '@components/Button'
import { RedoIcon, UndoIcon } from '@icons/index'

import styles from './Markdown.module.scss'

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

export interface MarkdownInputProps extends Omit<
	TextareaHTMLAttributes<HTMLTextAreaElement>,
	| 'value'
	| 'defaultValue'
	| 'onChange'
	| 'onBlur'
	| 'onFocus'
	| 'maxLength'
	| 'children'
> {
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

	/**
	 * Показывать floating Markdown toolbar.
	 *
	 * true — toolbar отображается при выделении текста.
	 * false — toolbar полностью отключён.
	 */
	showToolbar?: boolean

	className?: string
	textareaClassName?: string
	children?: ReactNode
	onToolbarAction?: (action: MarkdownToolbarAction) => void
	onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void
	onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void
}

type SelectionRect = SelectionAnchorRect

interface SelectionRange {
	start: number
	end: number
}

type MarkdownInlineAction = Extract<
	MarkdownToolbarAction,
	'bold' | 'italic' | 'strike' | 'code' | 'spoiler'
>

export interface MarkdownActiveStyles {
	bold: boolean
	italic: boolean
	strike: boolean
	code: boolean
	spoiler: boolean
}

interface MarkdownSpan {
	start: number
	end: number
	contentStart: number
	contentEnd: number
	action: MarkdownInlineAction
	marker: string
	closeMarker?: string
	composite?: boolean
}

const EMPTY_MARKDOWN_ACTIVE_STYLES: MarkdownActiveStyles = {
	bold: false,
	italic: false,
	strike: false,
	code: false,
	spoiler: false
}

const rangesOverlap = (
	aStart: number,
	aEnd: number,
	bStart: number,
	bEnd: number
): boolean => aStart < bEnd && bStart < aEnd

const rangeIsInside = (
	start: number,
	end: number,
	spanStart: number,
	spanEnd: number
): boolean => {
	if (start === end) {
		return start >= spanStart && start <= spanEnd
	}

	return start >= spanStart && end <= spanEnd
}

/**
 * Ищет пары одинаковых Markdown-разделителей.
 *
 * Поиск выполняется без тяжёлого markdown-parser: для toolbar нам
 * достаточно знать границы inline-ноды вокруг текущего selection/cursor.
 */
const collectDelimitedSpans = (
	value: string,
	marker: string,
	action: MarkdownInlineAction,
	composite = false
): MarkdownSpan[] => {
	const spans: MarkdownSpan[] = []
	let cursor = 0

	while (cursor < value.length) {
		const start = value.indexOf(marker, cursor)
		if (start === -1) break

		const contentStart = start + marker.length
		const end = value.indexOf(marker, contentStart)
		if (end === -1) break

		// Не считаем пустые пары вроде **** активным форматированием.
		if (end > contentStart) {
			spans.push({
				start,
				end: end + marker.length,
				contentStart,
				contentEnd: end,
				action,
				marker,
				closeMarker: marker,
				composite
			})
		}

		cursor = end + marker.length
	}

	return spans
}

const collectPairedSpans = (
	value: string,
	open: string,
	close: string,
	action: MarkdownInlineAction
): MarkdownSpan[] => {
	const spans: MarkdownSpan[] = []
	let cursor = 0

	while (cursor < value.length) {
		const start = value.indexOf(open, cursor)
		if (start === -1) break

		const contentStart = start + open.length
		const end = value.indexOf(close, contentStart)
		if (end === -1) break

		if (end > contentStart) {
			spans.push({
				start,
				end: end + close.length,
				contentStart,
				contentEnd: end,
				action,
				marker: open,
				closeMarker: close
			})
		}

		cursor = end + close.length
	}

	return spans
}

const getMarkdownSpans = (value: string): MarkdownSpan[] => {
	const composite = [
		...collectDelimitedSpans(value, '***', 'bold', true),
		...collectDelimitedSpans(value, '___', 'bold', true)
	]

	const regular: MarkdownSpan[] = [
		...collectDelimitedSpans(value, '**', 'bold'),
		...collectDelimitedSpans(value, '__', 'bold'),
		...collectDelimitedSpans(value, '*', 'italic'),
		...collectDelimitedSpans(value, '_', 'italic'),
		...collectDelimitedSpans(value, '~~', 'strike'),
		...collectDelimitedSpans(value, '`', 'code'),
		...collectDelimitedSpans(value, '||', 'spoiler'),
		// Поддерживаем существующий синтаксис проекта параллельно с ||...||.
		...collectPairedSpans(value, '[spoiler]', '[/spoiler]', 'spoiler')
	].filter(
		span =>
			!composite.some(compositeSpan =>
				rangesOverlap(
					span.start,
					span.end,
					compositeSpan.start,
					compositeSpan.end
				)
			)
	)

	return [...composite, ...regular]
}

/**
 * Определяет активные inline-стили для выделения или позиции курсора.
 *
 * Поддерживаются два сценария:
 * - выделены только буквы: `***слово***`, selection = `слово`;
 * - выделена вся конструкция: selection = `***слово***`.
 *
 * При cursor selectionStart === selectionEnd проверяется попадание курсора
 * внутрь content-range соответствующей Markdown-ноды.
 */
const getActiveMarkdownStyles = (
	value: string,
	start: number,
	end: number
): MarkdownActiveStyles => {
	if (!value || start < 0 || end < start) {
		return EMPTY_MARKDOWN_ACTIVE_STYLES
	}

	const spans = getMarkdownSpans(value)

	const active: MarkdownActiveStyles = {
		bold: false,
		italic: false,
		strike: false,
		code: false,
		spoiler: false
	}

	for (const span of spans) {
		/**
		 * Курсор.
		 *
		 * Если выделения нет, сохраняем прежнее поведение:
		 * курсор внутри содержимого Markdown-ноды
		 * делает соответствующий Toggle активным.
		 */
		if (start === end) {
			const cursorInsideContent =
				start >= span.contentStart && start <= span.contentEnd

			if (!cursorInsideContent) {
				continue
			}

			active[span.action] = true

			if (span.composite) {
				active.bold = true
				active.italic = true
			}

			continue
		}

		/**
		 * Есть выделение.
		 *
		 * Toggle считается активным только тогда,
		 * когда выделена ВСЯ Markdown-конструкция:
		 *
		 * **text**
		 * ~~text~~
		 * `text`
		 * [spoiler]text[/spoiler]
		 *
		 * В частности, выделение только содержимого:
		 *
		 * **text
		 *   ^^^^
		 *
		 * больше не считается активным.
		 */
		const entireMarkdownSpanSelected =
			start <= span.start && end >= span.end

		if (!entireMarkdownSpanSelected) {
			continue
		}

		active[span.action] = true

		if (span.composite) {
			active.bold = true
			active.italic = true
		}
	}

	return active
}

const findActiveMarkdownSpan = (
	value: string,
	start: number,
	end: number,
	action: MarkdownInlineAction
): MarkdownSpan | null => {
	const spans = getMarkdownSpans(value)

	return (
		spans.find(
			span =>
				(span.action === action ||
					(span.composite &&
						(action === 'bold' || action === 'italic'))) &&
				(rangeIsInside(start, end, span.start, span.end) ||
					(start === end
						? start >= span.contentStart && start <= span.contentEnd
						: rangesOverlap(
								start,
								end,
								span.contentStart,
								span.contentEnd
							)))
		) ?? null
	)
}

/**
 * Удаляет конкретный inline-маркер, не затрагивая остальные стили.
 *
 * Для `***text***`:
 * - toggle bold -> `*text*`
 * - toggle italic -> `**text**`
 */
const unwrapMarkdownSpan = (
	value: string,
	span: MarkdownSpan,
	action: MarkdownInlineAction
): string => {
	if (span.composite) {
		const markerChar = span.marker.charAt(0)
		const marker = markerChar.repeat(action === 'bold' ? 1 : 2)
		const content = value.slice(span.contentStart, span.contentEnd)

		return (
			value.slice(0, span.start) +
			marker +
			content +
			marker +
			value.slice(span.end)
		)
	}

	return (
		value.slice(0, span.start) +
		value.slice(span.contentStart, span.contentEnd) +
		value.slice(span.end)
	)
}

interface FloatingToolbarProps {
	selectionRect: SelectionRect | null
	canUndo: boolean
	canRedo: boolean
	disabled: boolean
	activeStyles: MarkdownActiveStyles
	onUndo: () => void
	onRedo: () => void
	onAction: (action: MarkdownToolbarAction) => void
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
		activeStyles,
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

		useIsomorphicLayoutEffect(() => {
			const toolbar = toolbarRef.current

			if (!toolbar || !selectionRect || disabled) {
				return
			}

			let cancelled = false

			const updatePosition = async () => {
				await new Promise<void>(resolve => {
					requestAnimationFrame(() => resolve())
				})

				if (cancelled) {
					return
				}

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

				if (cancelled) {
					return
				}

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

		useEffect(() => {
			if (!selectionRect) {
				setPositioned(false)
			}
		}, [selectionRect])

		if (!selectionRect || disabled) {
			return null
		}

		/**
		 * Не даём textarea потерять выделение при нажатии
		 * на кнопку floating toolbar.
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
				<Button
					variant='ghost'
					classNames={styles.toolbarButton}
					disabled={!canUndo}
					aria-label='Отменить'
					title='Отменить — Ctrl/Cmd + Z'
					iconStart={<UndoIcon />}
					onMouseDown={preventSelectionLoss}
					onClick={onUndo}
				/>

				<Button
					variant='ghost'
					classNames={styles.toolbarButton}
					disabled={!canRedo}
					aria-label='Повторить'
					title='Повторить — Ctrl/Cmd + Shift + Z'
					iconStart={<RedoIcon />}
					onMouseDown={preventSelectionLoss}
					onClick={onRedo}
				/>

				<span className={styles.toolbarDivider} />

				<Button
					variant='ghost'
					classNames={[
						styles.toolbarButton,
						activeStyles.bold ? styles.toolbarButtonActive : ''
					]
						.filter(Boolean)
						.join(' ')}
					aria-pressed={activeStyles.bold}
					aria-label='Жирный'
					title='Жирный'
					iconStart={<Bold aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('bold')}
				/>

				<Button
					variant='ghost'
					classNames={[
						styles.toolbarButton,
						activeStyles.italic ? styles.toolbarButtonActive : ''
					]
						.filter(Boolean)
						.join(' ')}
					aria-pressed={activeStyles.italic}
					aria-label='Курсив'
					title='Курсив'
					iconStart={<Italic aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('italic')}
				/>

				<Button
					variant='ghost'
					classNames={[
						styles.toolbarButton,
						activeStyles.strike ? styles.toolbarButtonActive : ''
					]
						.filter(Boolean)
						.join(' ')}
					aria-pressed={activeStyles.strike}
					aria-label='Зачёркнутый'
					title='Зачёркнутый'
					iconStart={<Strikethrough aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('strike')}
				/>

				<Button
					variant='ghost'
					classNames={[
						styles.toolbarButton,
						activeStyles.code ? styles.toolbarButtonActive : ''
					]
						.filter(Boolean)
						.join(' ')}
					aria-pressed={activeStyles.code}
					aria-label='Код'
					title='Код'
					iconStart={<Code2 aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('code')}
				/>

				<Button
					variant='ghost'
					classNames={[
						styles.toolbarButton,
						activeStyles.spoiler ? styles.toolbarButtonActive : ''
					]
						.filter(Boolean)
						.join(' ')}
					aria-pressed={activeStyles.spoiler}
					aria-label='Спойлер'
					title='Спойлер'
					iconStart={<Eye aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('spoiler')}
				/>

				<Button
					variant='ghost'
					classNames={styles.toolbarButton}
					aria-label='Ссылка'
					title='Ссылка'
					iconStart={<Link2 aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('link')}
				/>

				<Button
					variant='ghost'
					classNames={styles.toolbarButton}
					aria-label='Цитата'
					title='Цитата'
					iconStart={<Quote aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('quote')}
				/>

				<Button
					variant='ghost'
					classNames={styles.toolbarButton}
					aria-label='Маркированный список'
					title='Маркированный список'
					iconStart={<List aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('unordered-list')}
				/>

				<Button
					variant='ghost'
					classNames={styles.toolbarButton}
					aria-label='Нумерованный список'
					title='Нумерованный список'
					iconStart={<ListOrdered aria-hidden='true' />}
					onMouseDown={preventSelectionLoss}
					onClick={() => onAction('ordered-list')}
				/>
			</div>
		)

		return typeof document !== 'undefined'
			? createPortal(toolbar, getPortalRoot())
			: null
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
	action: MarkdownToolbarAction,
	active: boolean
) => {
	const selected = value.slice(start, end)

	if (
		active &&
		['bold', 'italic', 'strike', 'code', 'spoiler'].includes(action)
	) {
		const span = findActiveMarkdownSpan(
			value,
			start,
			end,
			action as MarkdownInlineAction
		)

		if (span) {
			const nextValue = unwrapMarkdownSpan(
				value,
				span,
				action as MarkdownInlineAction
			)
			const openRemoved = span.composite
				? action === 'bold'
					? 2
					: 1
				: span.marker.length
			const closeRemoved = span.composite
				? action === 'bold'
					? 2
					: 1
				: (span.closeMarker?.length ?? span.marker.length)

			const mapPosition = (position: number): number => {
				if (position <= span.start) {
					return position
				}

				if (position < span.contentStart) {
					return span.start
				}

				if (position <= span.contentEnd) {
					return position - openRemoved
				}

				return position - openRemoved - closeRemoved
			}

			const selectionStart = mapPosition(start)
			const selectionEnd = mapPosition(end)

			return {
				value: nextValue,
				selectionStart,
				selectionEnd
			}
		}
	}

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
			// Сохраняем синтаксис, который уже поддерживает MarkdownPreview.
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
	forwardRef<HTMLTextAreaElement, MarkdownInputProps>(
		(
			{
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
				showToolbar = true,
				className,
				textareaClassName,
				children,
				onToolbarAction,
				onBlur,
				onFocus,
				...textareaProps
			}: MarkdownInputProps,
			forwardedRef
		) => {
			const textareaRef = useRef<HTMLTextAreaElement>(null)

			const setTextareaRef = useCallback(
				(node: HTMLTextAreaElement | null) => {
					textareaRef.current = node

					if (typeof forwardedRef === 'function') {
						forwardedRef(node)
					} else if (forwardedRef) {
						forwardedRef.current = node
					}
				},
				[forwardedRef]
			)

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

			const [activeStyles, setActiveStyles] =
				useState<MarkdownActiveStyles>(EMPTY_MARKDOWN_ACTIVE_STYLES)

			const updateSelection = useCallback(() => {
				const textarea = textareaRef.current

				if (!textarea) return

				const start = textarea.selectionStart
				const end = textarea.selectionEnd

				if (start === end) {
					const nextActiveStyles = getActiveMarkdownStyles(
						textarea.value,
						start,
						end
					)

					selectionRef.current = { start, end }
					setActiveStyles(nextActiveStyles)

					const hasActiveStyle =
						Object.values(nextActiveStyles).some(Boolean)
					setSelectionRect(
						hasActiveStyle ? measureTextareaSelection(textarea) : null
					)
					return
				}

				selectionRef.current = {
					start,
					end
				}

				setActiveStyles(
					getActiveMarkdownStyles(textarea.value, start, end)
				)

				const rect = measureTextareaSelection(textarea)

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

				document.addEventListener(
					'selectionchange',
					handleSelectionChange
				)

				return () => {
					document.removeEventListener(
						'selectionchange',
						handleSelectionChange
					)
				}
			}, [updateSelection])

			/**
			 * Клик вне textarea и toolbar действительно закрывает toolbar.
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

			const restoreSelectionAfterHistoryChange = useCallback(() => {
				const textarea = textareaRef.current
				const selection = selectionRef.current

				if (!textarea || !selection) {
					return
				}

				requestAnimationFrame(() => {
					const currentTextarea = textareaRef.current

					if (!currentTextarea) {
						return
					}

					/**
					 * После undo/redo длина текста могла измениться.
					 * Поэтому ограничиваем selection актуальной длиной value.
					 */
					const start = Math.min(
						selection.start,
						currentTextarea.value.length
					)

					const end = Math.min(
						selection.end,
						currentTextarea.value.length
					)

					const nextSelection = {
						start: Math.min(start, end),
						end: Math.max(start, end)
					}

					selectionRef.current = nextSelection

					currentTextarea.focus()

					currentTextarea.setSelectionRange(
						nextSelection.start,
						nextSelection.end
					)

					/**
					 * Пересчитываем положение toolbar относительно
					 * нового содержимого textarea.
					 */
					updateSelection()
				})
			}, [updateSelection])

			const handleUndo = useCallback(() => {
				if (!history.canUndo) {
					return
				}

				history.undo()

				/**
				 * Не очищаем selectionRef и selectionRect.
				 *
				 * Toolbar должен остаться открыт после Undo.
				 */
				restoreSelectionAfterHistoryChange()
			}, [
				history.canUndo,
				history.undo,
				restoreSelectionAfterHistoryChange
			])

			const handleRedo = useCallback(() => {
				if (!history.canRedo) {
					return
				}

				history.redo()

				/**
				 * Toolbar должен остаться открыт после Redo.
				 */
				restoreSelectionAfterHistoryChange()
			}, [
				history.canRedo,
				history.redo,
				restoreSelectionAfterHistoryChange
			])

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

					const isActive =
						activeStyles[action as keyof MarkdownActiveStyles] ??
						false

					if (start === end && !isActive) {
						return
					}

					const result = applyMarkdownAction(
						history.value,
						start,
						end,
						action,
						isActive
					)

					/**
					 * Formatting — отдельное логическое действие.
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
					{showToolbar ? (
						<FloatingToolbar
							selectionRect={selectionRect}
							canUndo={Boolean(history.canUndo)}
							canRedo={Boolean(history.canRedo)}
							activeStyles={activeStyles}
							disabled={disabled || readOnly}
							onUndo={handleUndo}
							onRedo={handleRedo}
							onAction={handleToolbarAction}
						/>
					) : null}

					<textarea
						ref={setTextareaRef}
						className={textareaClassNameValue}
						value={history.value}
						placeholder={placeholder}
						disabled={disabled}
						readOnly={readOnly}
						maxLength={maxLength}
						rows={minRows}
						onChange={handleChange}
						onBlur={onBlur}
						onFocus={onFocus}
						{...textareaProps}
					/>

					{children}
				</div>
			)
		}
	)
)

MarkdownInput.displayName = 'MarkdownInput'
