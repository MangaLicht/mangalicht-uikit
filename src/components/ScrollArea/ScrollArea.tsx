import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	type HTMLAttributes,
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
	type UIEvent
} from 'react'
import styles from './ScrollArea.module.scss'

export type ScrollAreaVisibleMode = 'default' | 'none' | 'scroll'

export type ScrollAreaAxis = 'vertical' | 'horizontal' | 'both'

export interface ScrollAreaHandle {
	scrollTo(options: ScrollToOptions): void
}

export interface ScrollAreaProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'onScroll'
> {
	/** Контент, который должен прокручиваться */
	children: ReactNode

	/**
	 * Режим отображения кастомного scrollbar:
	 *
	 * default — виден всегда, если есть overflow
	 * none — полностью скрыт
	 * scroll — появляется во время прокрутки и исчезает после неё
	 */
	visibleMode?: ScrollAreaVisibleMode

	/**
	 * Направление прокрутки.
	 */
	axis?: ScrollAreaAxis

	/**
	 * Вызывается при прокрутке содержимого.
	 */
	onScroll?: (event: UIEvent<HTMLDivElement>) => void

	/**
	 * Дополнительный класс корневого элемента.
	 */
	classNames?: string
}

interface DragState {
	axis: 'vertical' | 'horizontal'
	pointerStart: number
	scrollStart: number
	scrollRange: number
	trackLength: number
	thumbLength: number
}

const SCROLLBAR_HIDE_DELAY = 700
const MIN_THUMB_SIZE = 24

export const ScrollArea = forwardRef<ScrollAreaHandle, ScrollAreaProps>(
	(
		{
			children,
			visibleMode = 'default',
			axis = 'vertical',
			onScroll,
			classNames,
			...rest
		},
		forwardedRef
	) => {
		const rootRef = useRef<HTMLDivElement | null>(null)

		const viewportRef = useRef<HTMLDivElement | null>(null)

		const contentRef = useRef<HTMLDivElement | null>(null)

		const verticalTrackRef = useRef<HTMLDivElement | null>(null)

		const verticalThumbRef = useRef<HTMLDivElement | null>(null)

		const horizontalTrackRef = useRef<HTMLDivElement | null>(null)

		const horizontalThumbRef = useRef<HTMLDivElement | null>(null)

		const dragRef = useRef<DragState | null>(null)

		const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

		const onScrollRef = useRef(onScroll)

		onScrollRef.current = onScroll

		/**
		 * Управление видимостью scrollbar без React state.
		 *
		 * Это важно для производительности:
		 * при каждом scroll не происходит React rerender.
		 */
		const setScrollingVisible = useCallback((visible: boolean) => {
			const root = rootRef.current

			if (!root) return

			root.dataset.scrolling = visible ? 'true' : 'false'
		}, [])

		/**
		 * Пересчитывает размеры и положение thumb.
		 *
		 * Функция изменяет DOM напрямую, поэтому
		 * прокрутка не вызывает React render.
		 */
		const updateThumbs = useCallback(() => {
			const viewport = viewportRef.current

			const root = rootRef.current

			const verticalTrack = verticalTrackRef.current

			const verticalThumb = verticalThumbRef.current

			const horizontalTrack = horizontalTrackRef.current

			const horizontalThumb = horizontalThumbRef.current

			if (!viewport || !root) {
				return
			}

			const verticalOverflow =
				axis === 'vertical' || axis === 'both'
					? viewport.scrollHeight > viewport.clientHeight + 1
					: false

			const horizontalOverflow =
				axis === 'horizontal' || axis === 'both'
					? viewport.scrollWidth > viewport.clientWidth + 1
					: false

			root.dataset.verticalOverflow = String(verticalOverflow)

			root.dataset.horizontalOverflow = String(horizontalOverflow)

			/**
			 * Vertical scrollbar
			 */
			if (verticalOverflow && verticalTrack && verticalThumb) {
				const trackLength = verticalTrack.clientHeight

				const ratio = viewport.clientHeight / viewport.scrollHeight

				const thumbLength = Math.min(
					trackLength,
					Math.max(MIN_THUMB_SIZE, trackLength * ratio)
				)

				const scrollRange =
					viewport.scrollHeight - viewport.clientHeight

				const thumbRange = Math.max(0, trackLength - thumbLength)

				const progress =
					scrollRange > 0 ? viewport.scrollTop / scrollRange : 0

				const position = thumbRange * progress

				verticalThumb.style.height = `${thumbLength}px`

				verticalThumb.style.transform = `translate3d(0, ${position}px, 0)`

				verticalThumb.setAttribute(
					'aria-valuenow',
					String(Math.round(progress * 100))
				)
			}

			/**
			 * Horizontal scrollbar
			 */
			if (horizontalOverflow && horizontalTrack && horizontalThumb) {
				const trackLength = horizontalTrack.clientWidth

				const ratio = viewport.clientWidth / viewport.scrollWidth

				const thumbLength = Math.min(
					trackLength,
					Math.max(MIN_THUMB_SIZE, trackLength * ratio)
				)

				const scrollRange = viewport.scrollWidth - viewport.clientWidth

				const thumbRange = Math.max(0, trackLength - thumbLength)

				const progress =
					scrollRange > 0 ? viewport.scrollLeft / scrollRange : 0

				const position = thumbRange * progress

				horizontalThumb.style.width = `${thumbLength}px`

				horizontalThumb.style.transform = `translate3d(${position}px, 0, 0)`

				horizontalThumb.setAttribute(
					'aria-valuenow',
					String(Math.round(progress * 100))
				)
			}
		}, [axis])

		/**
		 * Native scroll event.
		 */
		const handleScroll = useCallback(
			(event: Event) => {
				updateThumbs()

				if (visibleMode === 'scroll') {
					setScrollingVisible(true)

					if (hideTimerRef.current !== null) {
						clearTimeout(hideTimerRef.current)
					}

					hideTimerRef.current = setTimeout(() => {
						setScrollingVisible(false)

						hideTimerRef.current = null
					}, SCROLLBAR_HIDE_DELAY)
				}

				onScrollRef.current?.(
					event as unknown as UIEvent<HTMLDivElement>
				)
			},
			[setScrollingVisible, updateThumbs, visibleMode]
		)

		/**
		 * Imperative API.
		 */
		useImperativeHandle(
			forwardedRef,
			() => ({
				scrollTo(options: ScrollToOptions) {
					viewportRef.current?.scrollTo(options)
				}
			}),
			[]
		)

		/**
		 * ResizeObserver + MutationObserver.
		 *
		 * Нужны для пересчёта thumb, когда:
		 * - меняется размер контейнера;
		 * - меняется содержимое;
		 * - динамически добавляются элементы.
		 */
		useEffect(() => {
			const viewport = viewportRef.current

			if (!viewport) {
				return
			}

			updateThumbs()

			const resizeObserver = new ResizeObserver(() => {
				updateThumbs()
			})

			resizeObserver.observe(viewport)

			if (contentRef.current) {
				resizeObserver.observe(contentRef.current)
			}

			const mutationObserver = new MutationObserver(() => {
				updateThumbs()
			})

			mutationObserver.observe(viewport, {
				childList: true,
				subtree: true,
				characterData: true
			})

			return () => {
				resizeObserver.disconnect()
				mutationObserver.disconnect()
			}
		}, [updateThumbs])

		/**
		 * Подписка на scroll.
		 */
		useEffect(() => {
			const viewport = viewportRef.current

			if (!viewport) {
				return
			}

			viewport.addEventListener('scroll', handleScroll, {
				passive: true
			})

			return () => {
				viewport.removeEventListener('scroll', handleScroll)
			}
		}, [handleScroll])

		/**
		 * Cleanup таймера.
		 */
		useEffect(() => {
			return () => {
				if (hideTimerRef.current !== null) {
					clearTimeout(hideTimerRef.current)
				}
			}
		}, [])

		/**
		 * Drag & Drop scrollbar thumb.
		 */
		const handlePointerMove = useCallback((event: PointerEvent) => {
			const drag = dragRef.current

			const viewport = viewportRef.current

			if (!drag || !viewport) {
				return
			}

			const currentPointer =
				drag.axis === 'vertical' ? event.clientY : event.clientX

			const delta = currentPointer - drag.pointerStart

			const thumbRange = Math.max(1, drag.trackLength - drag.thumbLength)

			const scrollDelta = (delta / thumbRange) * drag.scrollRange

			if (drag.axis === 'vertical') {
				viewport.scrollTop = drag.scrollStart + scrollDelta
			} else {
				viewport.scrollLeft = drag.scrollStart + scrollDelta
			}

			event.preventDefault()
		}, [])

		const handlePointerUp = useCallback(() => {
			dragRef.current = null

			document.removeEventListener('pointermove', handlePointerMove)

			document.removeEventListener('pointerup', handlePointerUp)
		}, [handlePointerMove])

		const startDrag = useCallback(
			(
				event: ReactPointerEvent<HTMLDivElement>,
				dragAxis: 'vertical' | 'horizontal'
			) => {
				const viewport = viewportRef.current

				const track =
					dragAxis === 'vertical'
						? verticalTrackRef.current
						: horizontalTrackRef.current

				const thumb =
					dragAxis === 'vertical'
						? verticalThumbRef.current
						: horizontalThumbRef.current

				if (!viewport || !track || !thumb) {
					return
				}

				const isVertical = dragAxis === 'vertical'

				const scrollRange = isVertical
					? viewport.scrollHeight - viewport.clientHeight
					: viewport.scrollWidth - viewport.clientWidth

				const trackLength = isVertical
					? track.clientHeight
					: track.clientWidth

				const thumbLength = isVertical
					? thumb.clientHeight
					: thumb.clientWidth

				dragRef.current = {
					axis: dragAxis,

					pointerStart: isVertical ? event.clientY : event.clientX,

					scrollStart: isVertical
						? viewport.scrollTop
						: viewport.scrollLeft,

					scrollRange,
					trackLength,
					thumbLength
				}

				document.addEventListener('pointermove', handlePointerMove, {
					passive: false
				})

				document.addEventListener('pointerup', handlePointerUp, {
					once: true
				})

				event.preventDefault()
				event.stopPropagation()
			},
			[handlePointerMove, handlePointerUp]
		)

		/**
		 * Keyboard control для thumb.
		 */
		const handleThumbKeyDown = useCallback(
			(
				event: React.KeyboardEvent<HTMLDivElement>,
				dragAxis: 'vertical' | 'horizontal'
			) => {
				const viewport = viewportRef.current

				if (!viewport) {
					return
				}

				const isVertical = dragAxis === 'vertical'

				const pageSize = isVertical
					? viewport.clientHeight
					: viewport.clientWidth

				const step = 40

				let delta = 0

				if (isVertical) {
					if (event.key === 'ArrowDown') {
						delta = step
					}

					if (event.key === 'ArrowUp') {
						delta = -step
					}

					if (event.key === 'PageDown') {
						delta = pageSize
					}

					if (event.key === 'PageUp') {
						delta = -pageSize
					}
				} else {
					if (event.key === 'ArrowRight') {
						delta = step
					}

					if (event.key === 'ArrowLeft') {
						delta = -step
					}

					if (event.key === 'PageDown') {
						delta = pageSize
					}

					if (event.key === 'PageUp') {
						delta = -pageSize
					}
				}

				if (event.key === 'Home') {
					event.preventDefault()

					viewport.scrollTo({
						...(isVertical ? { top: 0 } : { left: 0 }),
						behavior: 'smooth'
					})

					return
				}

				if (event.key === 'End') {
					event.preventDefault()

					viewport.scrollTo({
						...(isVertical
							? {
									top: viewport.scrollHeight
								}
							: {
									left: viewport.scrollWidth
								}),
						behavior: 'smooth'
					})

					return
				}

				if (delta === 0) {
					return
				}

				event.preventDefault()

				viewport.scrollBy({
					...(isVertical ? { top: delta } : { left: delta }),
					behavior: 'smooth'
				})
			},
			[]
		)

		return (
			<div
				ref={rootRef}
				className={[styles.root, classNames].filter(Boolean).join(' ')}
				data-axis={axis}
				data-visible-mode={visibleMode}
				data-scrolling='false'
				data-vertical-overflow='false'
				data-horizontal-overflow='false'
				{...rest}
			>
				<div ref={viewportRef} className={styles.viewport}>
					<div ref={contentRef} className={styles.content}>
						{children}
					</div>
				</div>

				{/* Vertical scrollbar */}
				<div ref={verticalTrackRef} className={styles.verticalTrack}>
					<div
						ref={verticalThumbRef}
						className={styles.thumb}
						role='scrollbar'
						tabIndex={0}
						aria-orientation='vertical'
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={0}
						aria-label='Вертикальная прокрутка'
						onPointerDown={event => startDrag(event, 'vertical')}
						onKeyDown={event =>
							handleThumbKeyDown(event, 'vertical')
						}
					/>
				</div>

				{/* Horizontal scrollbar */}
				<div
					ref={horizontalTrackRef}
					className={styles.horizontalTrack}
				>
					<div
						ref={horizontalThumbRef}
						className={styles.thumb}
						role='scrollbar'
						tabIndex={0}
						aria-orientation='horizontal'
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={0}
						aria-label='Горизонтальная прокрутка'
						onPointerDown={event => startDrag(event, 'horizontal')}
						onKeyDown={event =>
							handleThumbKeyDown(event, 'horizontal')
						}
					/>
				</div>
			</div>
		)
	}
)

ScrollArea.displayName = 'ScrollArea'
