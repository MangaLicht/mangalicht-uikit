import { useIsomorphicLayoutEffect } from '@hooks/useIsomorphicLayoutEffect'
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './Carousel.module.scss'

export interface CarouselSlide {
	id: string
	content: React.ReactNode
}

export interface CarouselProps {
	slides: CarouselSlide[]
	activeIndex?: number
	defaultActiveIndex?: number
	onSlideChange?: (index: number) => void
	autoPlayInterval?: number
	showArrows?: boolean
	showDots?: boolean
	height?: number
	collapsedWidth?: number
	gap?: number
	variant?: 'default' | 'card'
	cardWidth?: number
	cardHeight?: number
	swipe?: boolean
	dotsPosition?: 'outside' | 'inside'
	classNames?: string
}

const COPIES = 5
const CENTER_COPY = Math.floor(COPIES / 2)
const TRANSITION_DURATION = 400
// Страховка: максимум через это время карусель станет видимой,
// даже если ширина не «стабилизируется» по нашему критерию
const READY_FALLBACK_MS = 300

const normalizeIndex = (index: number, count: number) => {
	if (count <= 0) {
		return 0
	}
	return ((index % count) + count) % count
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
	(
		{
			slides,
			activeIndex,
			defaultActiveIndex = 0,
			onSlideChange,
			autoPlayInterval,
			showArrows = true,
			showDots = true,
			height,
			collapsedWidth = 86,
			gap = 6,
			variant = 'default',
			cardWidth = 314,
			cardHeight = 346,
			swipe = variant === 'card',
			dotsPosition = 'outside',
			classNames
		},
		forwardedRef
	) => {
		const realCount = slides.length
		const containerRef = useRef<HTMLDivElement | null>(null)
		const trackRef = useRef<HTMLDivElement | null>(null)
		const isTransitioningRef = useRef(false)
		const transitionTimeoutRef = useRef<number | null>(null)
		const resetFrameRef = useRef<number | null>(null)
		const resetSecondFrameRef = useRef<number | null>(null)
		const isControlled = activeIndex !== undefined
		const initialIndex = normalizeIndex(
			isControlled ? (activeIndex ?? 0) : defaultActiveIndex,
			realCount
		)
		const [internalIndex, setInternalIndex] = useState(initialIndex)
		const currentIndex = isControlled
			? normalizeIndex(activeIndex ?? 0, realCount)
			: internalIndex
		const initialPosition = CENTER_COPY * realCount + initialIndex
		const [displayPosition, setDisplayPosition] = useState(initialPosition)
		const [isResetting, setIsResetting] = useState(false)
		const [initialRenderComplete, setInitialRenderComplete] =
			useState(false)
		const [containerWidth, setContainerWidth] = useState(0)
		const [hasMeasuredWidth, setHasMeasuredWidth] = useState(false)

		const setContainerRef = useCallback((node: HTMLDivElement | null) => {
			containerRef.current = node
			if (node) {
				setContainerWidth(node.getBoundingClientRect().width)
			}
		}, [])

		const [dragOffset, setDragOffset] = useState(0)
		const swipeStartXRef = useRef<number | null>(null)
		const swipeLastXRef = useRef<number | null>(null)
		const swipePointerIdRef = useRef<number | null>(null)
		const swipeMovedRef = useRef(false)

		useIsomorphicLayoutEffect(() => {
			setInitialRenderComplete(true)
		}, [])

		/**
		 * ------------------------------------------------------------
		 * Измерение ширины + флаг готовности
		 * ------------------------------------------------------------
		 *
		 * ResizeObserver стреляет один раз при observe() и далее ТОЛЬКО
		 * при изменении размера. Поэтому критерий стабильности —
		 * «ширина повторилась два раза подряд» (ручное измерение +
		 * первый callback RO). Ждать большего нельзя: если размер не
		 * изменится, callback больше не придёт и карусель останется
		 * скрытой навсегда.
		 *
		 * Плюс страховочный таймаут: даже в вырожденном случае
		 * (первое значение RO не совпало с ручным и тишина дальше)
		 * карусель гарантированно появится через READY_FALLBACK_MS.
		 */
		useIsomorphicLayoutEffect(() => {
			const node = containerRef.current
			if (!node) {
				return undefined
			}

			let lastWidth: number | null = null
			let equalCount = 0

			const updateWidth = (width: number) => {
				setContainerWidth(width)

				if (lastWidth !== null && width === lastWidth) {
					equalCount += 1
				} else {
					equalCount = 0
				}
				lastWidth = width

				// Ширина повторилась — считаем её стабильной, показываем карусель
				if (equalCount >= 1) {
					setHasMeasuredWidth(true)
				}
			}

			// Первое измерение
			updateWidth(node.getBoundingClientRect().width)

			const observer = new ResizeObserver(entries => {
				const width = entries[0]?.contentRect.width ?? 0
				updateWidth(width)
			})
			observer.observe(node)

			// Страховка от вечного visibility: hidden
			const fallbackTimer = window.setTimeout(() => {
				setHasMeasuredWidth(true)
			}, READY_FALLBACK_MS)

			return () => {
				observer.disconnect()
				window.clearTimeout(fallbackTimer)
			}
		}, [])

		const isReady = initialRenderComplete && hasMeasuredWidth

		const extendedSlides = useMemo(() => {
			if (realCount === 0) {
				return []
			}
			const result: CarouselSlide[] = []
			for (let copy = 0; copy < COPIES; copy += 1) {
				for (let index = 0; index < realCount; index += 1) {
					const slide = slides[index]
					result.push({
						...slide,
						id: `__carousel-${copy}-${index}__${slide.id}`
					})
				}
			}
			return result
		}, [slides, realCount])

		const getRealIndex = useCallback(
			(position: number) => {
				return normalizeIndex(position, realCount)
			},
			[realCount]
		)

		const activeWidth = useMemo(() => {
			if (realCount === 0 || containerWidth <= 0) {
				return collapsedWidth
			}
			const collapsedTotal = (realCount - 1) * (collapsedWidth + gap * 2)
			return Math.max(
				containerWidth - collapsedTotal - gap * 2,
				collapsedWidth
			)
		}, [containerWidth, realCount, collapsedWidth, gap])

		const widths = useMemo(() => {
			if (variant === 'card') {
				return extendedSlides.map(() =>
					Math.min(cardWidth, Math.max(containerWidth, 0))
				)
			}
			return extendedSlides.map((_, index) => {
				return index === displayPosition ? activeWidth : collapsedWidth
			})
		}, [
			extendedSlides,
			displayPosition,
			activeWidth,
			collapsedWidth,
			variant,
			containerWidth,
			cardWidth
		])

		const trackOffset = useMemo(() => {
			if (variant === 'card') {
				const currentWidth = Math.min(
					cardWidth,
					Math.max(containerWidth, 0)
				)
				const centerOffset = Math.max(
					(containerWidth - currentWidth) / 2,
					0
				)
				return (
					displayPosition * (currentWidth + gap * 2) +
					gap -
					centerOffset
				)
			}
			let offset = 0
			for (let index = 0; index < displayPosition; index += 1) {
				offset += widths[index] + gap * 2
			}
			return offset
		}, [widths, displayPosition, gap, variant, containerWidth, cardWidth])

		const clearAnimationHandles = useCallback(() => {
			if (transitionTimeoutRef.current !== null) {
				window.clearTimeout(transitionTimeoutRef.current)
				transitionTimeoutRef.current = null
			}
			if (resetFrameRef.current !== null) {
				cancelAnimationFrame(resetFrameRef.current)
				resetFrameRef.current = null
			}
			if (resetSecondFrameRef.current !== null) {
				cancelAnimationFrame(resetSecondFrameRef.current)
				resetSecondFrameRef.current = null
			}
		}, [])

		const resetToCenter = useCallback(
			(realIndex: number) => {
				if (realCount === 0) {
					isTransitioningRef.current = false
					return
				}
				const normalizedIndex = normalizeIndex(realIndex, realCount)
				const centerPosition = CENTER_COPY * realCount + normalizedIndex
				setIsResetting(true)
				setDisplayPosition(centerPosition)
			},
			[realCount]
		)

		useIsomorphicLayoutEffect(() => {
			if (!isResetting) {
				return undefined
			}
			const track = trackRef.current
			if (!track) {
				setIsResetting(false)
				isTransitioningRef.current = false
				return undefined
			}
			void track.offsetWidth
			resetFrameRef.current = requestAnimationFrame(() => {
				resetFrameRef.current = null
				void track.offsetWidth
				resetSecondFrameRef.current = requestAnimationFrame(() => {
					resetSecondFrameRef.current = null
					setIsResetting(false)
					isTransitioningRef.current = false
				})
			})
			return () => {
				if (resetFrameRef.current !== null) {
					cancelAnimationFrame(resetFrameRef.current)
					resetFrameRef.current = null
				}
				if (resetSecondFrameRef.current !== null) {
					cancelAnimationFrame(resetSecondFrameRef.current)
					resetSecondFrameRef.current = null
				}
			}
		}, [isResetting, displayPosition])

		const finishTransition = useCallback(
			(realIndex: number) => {
				if (transitionTimeoutRef.current !== null) {
					window.clearTimeout(transitionTimeoutRef.current)
					transitionTimeoutRef.current = null
				}
				const normalizedIndex = normalizeIndex(realIndex, realCount)
				if (!isControlled) {
					setInternalIndex(normalizedIndex)
				}
				onSlideChange?.(normalizedIndex)
				resetToCenter(normalizedIndex)
			},
			[realCount, isControlled, onSlideChange, resetToCenter]
		)

		const moveToPosition = useCallback(
			(targetPosition: number, targetRealIndex?: number) => {
				if (realCount === 0 || isTransitioningRef.current) {
					return
				}
				if (targetPosition === displayPosition) {
					return
				}
				const realIndex =
					targetRealIndex ?? getRealIndex(targetPosition)
				isTransitioningRef.current = true
				setDisplayPosition(targetPosition)
				transitionTimeoutRef.current = window.setTimeout(() => {
					finishTransition(realIndex)
				}, TRANSITION_DURATION)
			},
			[realCount, displayPosition, getRealIndex, finishTransition]
		)

		const moveNext = useCallback(() => {
			if (realCount === 0 || isTransitioningRef.current) {
				return
			}
			const targetPosition = displayPosition + 1
			moveToPosition(targetPosition, getRealIndex(targetPosition))
		}, [realCount, displayPosition, getRealIndex, moveToPosition])

		const movePrev = useCallback(() => {
			if (realCount === 0 || isTransitioningRef.current) {
				return
			}
			const targetPosition = displayPosition - 1
			moveToPosition(targetPosition, getRealIndex(targetPosition))
		}, [realCount, displayPosition, getRealIndex, moveToPosition])

		const handleSlideClick = useCallback(
			(position: number) => {
				if (isTransitioningRef.current) {
					return
				}
				if (position === displayPosition) {
					return
				}
				const realIndex = getRealIndex(position)
				moveToPosition(position, realIndex)
			},
			[displayPosition, getRealIndex, moveToPosition]
		)

		const handlePointerDown = useCallback(
			(event: React.PointerEvent<HTMLDivElement>) => {
				if (
					!swipe ||
					isTransitioningRef.current ||
					event.pointerType === 'mouse'
				) {
					return
				}
				swipeStartXRef.current = event.clientX
				swipeLastXRef.current = event.clientX
				swipePointerIdRef.current = event.pointerId
				swipeMovedRef.current = false
				setDragOffset(0)
				event.currentTarget.setPointerCapture(event.pointerId)
			},
			[swipe]
		)

		const handlePointerMove = useCallback(
			(event: React.PointerEvent<HTMLDivElement>) => {
				if (
					!swipe ||
					swipePointerIdRef.current !== event.pointerId ||
					swipeStartXRef.current === null
				) {
					return
				}
				const delta = event.clientX - swipeStartXRef.current
				swipeLastXRef.current = event.clientX
				if (Math.abs(delta) > 6) {
					swipeMovedRef.current = true
				}
				setDragOffset(delta)
			},
			[swipe]
		)

		const finishSwipe = useCallback(
			(event: React.PointerEvent<HTMLDivElement>) => {
				if (swipePointerIdRef.current !== event.pointerId) {
					return
				}
				const delta =
					(swipeLastXRef.current ??
						swipeStartXRef.current ??
						event.clientX) -
					(swipeStartXRef.current ?? event.clientX)
				swipeStartXRef.current = null
				swipeLastXRef.current = null
				swipePointerIdRef.current = null
				setDragOffset(0)
				if (Math.abs(delta) < 48 || isTransitioningRef.current) {
					return
				}
				if (delta < 0) {
					moveNext()
				} else {
					movePrev()
				}
			},
			[moveNext, movePrev]
		)

		const handlePointerCancel = useCallback(() => {
			swipeStartXRef.current = null
			swipeLastXRef.current = null
			swipePointerIdRef.current = null
			setDragOffset(0)
		}, [])

		const previousControlledIndexRef = useRef<number | null>(
			isControlled ? currentIndex : null
		)
		useEffect(() => {
			if (!isControlled || realCount === 0) {
				return
			}
			const targetIndex = normalizeIndex(activeIndex ?? 0, realCount)
			const previousIndex = previousControlledIndexRef.current
			previousControlledIndexRef.current = targetIndex
			if (isTransitioningRef.current) {
				return
			}
			if (previousIndex === targetIndex) {
				return
			}
			const currentRealIndex = getRealIndex(displayPosition)
			if (currentRealIndex === targetIndex) {
				return
			}
			setIsResetting(true)
			setDisplayPosition(CENTER_COPY * realCount + targetIndex)
			if (!isControlled) {
				setInternalIndex(targetIndex)
			}
		}, [
			activeIndex,
			isControlled,
			realCount,
			displayPosition,
			getRealIndex
		])

		const previousRealCountRef = useRef(realCount)
		useEffect(() => {
			const previousCount = previousRealCountRef.current
			if (previousCount === realCount) {
				return
			}
			previousRealCountRef.current = realCount
			clearAnimationHandles()
			isTransitioningRef.current = false
			if (realCount === 0) {
				setInternalIndex(0)
				setDisplayPosition(0)
				return
			}
			const nextIndex = normalizeIndex(currentIndex, realCount)
			setInternalIndex(nextIndex)
			setIsResetting(true)
			setDisplayPosition(CENTER_COPY * realCount + nextIndex)
		}, [realCount, currentIndex, clearAnimationHandles])

		useEffect(() => {
			if (!autoPlayInterval || realCount === 0) {
				return undefined
			}
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
				return undefined
			}
			const timer = window.setInterval(() => {
				if (isTransitioningRef.current) {
					return
				}
				moveNext()
			}, autoPlayInterval)
			return () => {
				window.clearInterval(timer)
			}
		}, [autoPlayInterval, realCount, moveNext])

		useEffect(() => {
			return () => {
				clearAnimationHandles()
			}
		}, [clearAnimationHandles])

		const renderDots = (position: 'outside' | 'inside') => {
			if (!showDots || dotsPosition !== position) {
				return null
			}
			return (
				<div className={styles.dots} data-position={position}>
					{slides.map((slide, index) => (
						<button
							type='button'
							key={slide.id}
							className={styles.dot}
							aria-label={`Перейти к слайду ${index + 1}`}
							aria-current={
								index === currentIndex ? 'true' : undefined
							}
							data-active={index === currentIndex}
							onClick={() => {
								if (
									index === currentIndex ||
									isTransitioningRef.current
								) {
									return
								}
								const currentPosition = displayPosition
								const currentRealIndex =
									getRealIndex(currentPosition)
								const forwardDistance = normalizeIndex(
									index - currentRealIndex,
									realCount
								)
								const backwardDistance = normalizeIndex(
									currentRealIndex - index,
									realCount
								)
								const targetPosition =
									forwardDistance <= backwardDistance
										? currentPosition + forwardDistance
										: currentPosition - backwardDistance
								moveToPosition(targetPosition, index)
							}}
						/>
					))}
				</div>
			)
		}

		if (realCount === 0) {
			return (
				<div
					ref={forwardedRef}
					className={[styles.carousel, classNames]
						.filter(Boolean)
						.join(' ')}
					data-variant={variant}
					data-ready='true'
					style={{
						...(height ? { height } : {}),
						...(variant === 'card'
							? ({
									'--carousel-card-width': `${cardWidth}px`,
									'--carousel-card-height': `${cardHeight}px`
								} as React.CSSProperties)
							: {})
					}}
				/>
			)
		}

		const Arrows = () => {
			if (!showArrows) return null

			return (
				<>
					<button
						type='button'
						className={styles.arrow}
						data-side='prev'
						aria-label='Предыдущий слайд'
						onClick={movePrev}
					>
						<ChevronDown aria-hidden='true' />
					</button>
					<button
						type='button'
						className={styles.arrow}
						data-side='next'
						aria-label='Следующий слайд'
						onClick={moveNext}
					>
						<ChevronDown aria-hidden='true' />
					</button>
				</>
			)
		}

		return (
			<div
				ref={forwardedRef}
				className={[styles.carousel, classNames]
					.filter(Boolean)
					.join(' ')}
				data-variant={variant}
				data-ready={isReady}
				style={{
					...(height ? { height } : {}),
					...(variant === 'card'
						? ({
								'--carousel-card-width': `${cardWidth}px`,
								'--carousel-card-height': `${cardHeight}px`
							} as React.CSSProperties)
						: {})
				}}
			>
				<div
					ref={setContainerRef}
					className={styles.viewport}
					data-swipe={swipe}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={finishSwipe}
					onPointerCancel={handlePointerCancel}
				>
					<div
						ref={trackRef}
						role='list'
						className={styles.track}
						style={{
							transform: `translate3d(${-(trackOffset - dragOffset)}px, 0, 0)`,
							// Пока ширина не готова — transition выключен,
							// чтобы коррекция offset не проигрывалась как перемотка
							transition:
								!isReady || isResetting
									? 'none'
									: `transform ${TRANSITION_DURATION}ms ease`
						}}
					>
						{extendedSlides.map((slide, index) => (
							<div
								key={slide.id}
								role='listitem'
								className={styles.slide}
								data-active={index === displayPosition}
								data-variant={variant}
								style={{
									width: widths[index],
									height:
										variant === 'card'
											? cardHeight
											: undefined,
									margin: `0 ${gap}px`,
									transition:
										isResetting || !isReady
											? 'none'
											: undefined
								}}
								onClick={() => handleSlideClick(index)}
							>
								{slide.content}
							</div>
						))}
					</div>
					<Arrows />
					{renderDots('inside')}
				</div>
				{renderDots('outside')}
			</div>
		)
	}
)

Carousel.displayName = 'Carousel'
