import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	type HTMLAttributes,
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
	type UIEvent,
	type Ref
} from 'react'
import styles from './ScrollArea.module.scss'

export type ScrollAreaVisibleMode = 'default' | 'none' | 'scroll'
export type ScrollAreaAxis = 'vertical' | 'horizontal' | 'both'

export interface ScrollAreaHandle {
	scrollTo(options: ScrollToOptions): void
	scrollBy(options: ScrollToOptions): void
	getElement(): HTMLDivElement | null
}

export type ScrollAreaRef = ScrollAreaHandle

export interface ScrollAreaProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'onScroll'
> {
	children: ReactNode
	visibleMode?: ScrollAreaVisibleMode
	axis?: ScrollAreaAxis
	onScroll?: (event: UIEvent<HTMLDivElement>) => void
	classNames?: string
	/** DOM-ref корневого scroll-container. Полезен для anchored/portal компонентов. */
	elementRef?: Ref<HTMLDivElement>
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
			elementRef,
			...rest
		},
		forwardedRef
	) => {
		const rootRef = useRef<HTMLDivElement | null>(null)
		const contentRef = useRef<HTMLDivElement | null>(null)
		const verticalTrackRef = useRef<HTMLDivElement | null>(null)
		const verticalThumbRef = useRef<HTMLDivElement | null>(null)
		const horizontalTrackRef = useRef<HTMLDivElement | null>(null)
		const horizontalThumbRef = useRef<HTMLDivElement | null>(null)
		const dragRef = useRef<DragState | null>(null)
		const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
		const onScrollRef = useRef(onScroll)

		onScrollRef.current = onScroll

		const setRootRef = useCallback(
			(node: HTMLDivElement | null) => {
				rootRef.current = node
				if (!elementRef) return
				if (typeof elementRef === 'function') elementRef(node)
				else elementRef.current = node
			},
			[elementRef]
		)

		const setScrollingVisible = useCallback((visible: boolean) => {
			if (rootRef.current) {
				rootRef.current.dataset.scrolling = String(visible)
			}
		}, [])

		const updateThumbs = useCallback(() => {
			const root = rootRef.current
			const verticalTrack = verticalTrackRef.current
			const verticalThumb = verticalThumbRef.current
			const horizontalTrack = horizontalTrackRef.current
			const horizontalThumb = horizontalThumbRef.current

			if (!root) return

			const verticalOverflow =
				(axis === 'vertical' || axis === 'both') &&
				root.scrollHeight > root.clientHeight + 1

			const horizontalOverflow =
				(axis === 'horizontal' || axis === 'both') &&
				root.scrollWidth > root.clientWidth + 1

			root.dataset.verticalOverflow = String(verticalOverflow)
			root.dataset.horizontalOverflow = String(horizontalOverflow)

			if (verticalOverflow && verticalTrack && verticalThumb) {
				const trackLength = verticalTrack.clientHeight
				const ratio = root.clientHeight / root.scrollHeight
				const thumbLength = Math.min(
					trackLength,
					Math.max(MIN_THUMB_SIZE, trackLength * ratio)
				)
				const scrollRange = root.scrollHeight - root.clientHeight
				const thumbRange = Math.max(0, trackLength - thumbLength)
				const progress = scrollRange > 0 ? root.scrollTop / scrollRange : 0

				verticalThumb.style.height = `${thumbLength}px`
				verticalThumb.style.transform = `translate3d(0, ${thumbRange * progress}px, 0)`
				verticalThumb.setAttribute(
					'aria-valuenow',
					String(Math.round(progress * 100))
				)
			}

			if (horizontalOverflow && horizontalTrack && horizontalThumb) {
				const trackLength = horizontalTrack.clientWidth
				const ratio = root.clientWidth / root.scrollWidth
				const thumbLength = Math.min(
					trackLength,
					Math.max(MIN_THUMB_SIZE, trackLength * ratio)
				)
				const scrollRange = root.scrollWidth - root.clientWidth
				const thumbRange = Math.max(0, trackLength - thumbLength)
				const progress = scrollRange > 0 ? root.scrollLeft / scrollRange : 0

				horizontalThumb.style.width = `${thumbLength}px`
				horizontalThumb.style.transform = `translate3d(${thumbRange * progress}px, 0, 0)`
				horizontalThumb.setAttribute(
					'aria-valuenow',
					String(Math.round(progress * 100))
				)
			}
		}, [axis])

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

			onScrollRef.current?.(event as unknown as UIEvent<HTMLDivElement>)
		}, [setScrollingVisible, updateThumbs, visibleMode])

		useImperativeHandle(
			forwardedRef,
			() => ({
				scrollTo(options) {
					rootRef.current?.scrollTo(options)
				},
				scrollBy(options) {
					rootRef.current?.scrollBy(options)
				},
				getElement() {
					return rootRef.current
				}
			}),
			[]
		)

		useEffect(() => {
			const root = rootRef.current
			if (!root) return undefined

			updateThumbs()

			const resizeObserver = new ResizeObserver(updateThumbs)
			resizeObserver.observe(root)
			if (contentRef.current) resizeObserver.observe(contentRef.current)

			const mutationObserver = new MutationObserver(updateThumbs)
			mutationObserver.observe(root, {
				childList: true,
				subtree: true,
				characterData: true,
				attributes: true
			})

			root.addEventListener('scroll', handleScroll, { passive: true })

			return () => {
				resizeObserver.disconnect()
				mutationObserver.disconnect()
				root.removeEventListener('scroll', handleScroll)
			}
		}, [handleScroll, updateThumbs])

		useEffect(() => {
			return () => {
				if (hideTimerRef.current !== null) {
					clearTimeout(hideTimerRef.current)
				}
			}
		}, [])

		const handlePointerMove = useCallback((event: PointerEvent) => {
			const drag = dragRef.current
			const root = rootRef.current
		if (!drag || !root) return

			const pointer =
				drag.axis === 'vertical' ? event.clientY : event.clientX
			const delta = pointer - drag.pointerStart
			const thumbRange = Math.max(
				1,
				drag.trackLength - drag.thumbLength
			)
			const scrollDelta = (delta / thumbRange) * drag.scrollRange

			if (drag.axis === 'vertical') {
				root.scrollTop = drag.scrollStart + scrollDelta
			} else {
				root.scrollLeft = drag.scrollStart + scrollDelta
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
				const root = rootRef.current
				const track =
					dragAxis === 'vertical'
						? verticalTrackRef.current
						: horizontalTrackRef.current
				const thumb =
					dragAxis === 'vertical'
						? verticalThumbRef.current
						: horizontalThumbRef.current

				if (!root || !track || !thumb) return

				const vertical = dragAxis === 'vertical'
				dragRef.current = {
					axis: dragAxis,
					pointerStart: vertical ? event.clientY : event.clientX,
					scrollStart: vertical ? root.scrollTop : root.scrollLeft,
					scrollRange: vertical
						? root.scrollHeight - root.clientHeight
						: root.scrollWidth - root.clientWidth,
					trackLength: vertical
						? track.clientHeight
						: track.clientWidth,
					thumbLength: vertical
						? thumb.clientHeight
						: thumb.clientWidth
				}

				document.addEventListener('pointermove', handlePointerMove, {
					passive: false
				})
				document.addEventListener('pointerup', handlePointerUp)
				document.addEventListener('pointercancel', handlePointerUp)
				event.preventDefault()
				event.stopPropagation()
			},
			[handlePointerMove, handlePointerUp]
		)

		const handleThumbKeyDown = useCallback(
			(
				event: React.KeyboardEvent<HTMLDivElement>,
				dragAxis: 'vertical' | 'horizontal'
			) => {
				const root = rootRef.current
				if (!root) return

				const vertical = dragAxis === 'vertical'
				const pageSize = vertical ? root.clientHeight : root.clientWidth
				const step = 40
				let delta = 0

				switch (event.key) {
					case vertical ? 'ArrowDown' : 'ArrowRight':
						delta = step
						break
					case vertical ? 'ArrowUp' : 'ArrowLeft':
						delta = -step
						break
					case 'PageDown':
						delta = pageSize
						break
					case 'PageUp':
						delta = -pageSize
						break
					case 'Home':
						event.preventDefault()
						root.scrollTo({
							...(vertical ? { top: 0 } : { left: 0 })
						})
						return
					case 'End':
						event.preventDefault()
						root.scrollTo({
							...(vertical
								? { top: root.scrollHeight }
								: { left: root.scrollWidth })
						})
						return
					default:
						return
				}

				event.preventDefault()
				root.scrollBy({
					...(vertical ? { top: delta } : { left: delta })
				})
			},
			[]
		)

		return (
			<div
				ref={setRootRef}
				className={[styles.root, classNames].filter(Boolean).join(' ')}
				data-axis={axis}
				data-visible-mode={visibleMode}
				data-scrolling='false'
				data-vertical-overflow='false'
				data-horizontal-overflow='false'
				{...rest}
			>
				<div ref={contentRef} className={styles.content}>
					{children}
				</div>

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
						onKeyDown={event => handleThumbKeyDown(event, 'vertical')}
					/>
				</div>

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
						onKeyDown={event => handleThumbKeyDown(event, 'horizontal')}
					/>
				</div>
			</div>
		)
	}
)

ScrollArea.displayName = 'ScrollArea'
