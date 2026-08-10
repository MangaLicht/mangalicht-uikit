import React, {
	forwardRef,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { ChevronIcon } from '@icons/Chevron'
import styles from './Carousel.module.scss'

export interface CarouselSlide {
	id: string
	content: React.ReactNode
}

export interface CarouselProps extends IUIKitProps {
	slides: CarouselSlide[]
	activeIndex?: number
	defaultActiveIndex?: number
	onSlideChange?: (index: number) => void
	autoPlayInterval?: number
	showArrows?: boolean
	height?: number
	collapsedWidth?: number
	gap?: number
}

/**
Количество физических копий массива.
При 3 слайдах получится:
1 2 3 | 1 2 3 | 1 2 3 | 1 2 3 | 1 2 3
            ↑
         рабочая зона
*/
const COPIES = 5
const CENTER_COPY = Math.floor(COPIES / 2)

/**
Должно совпадать с transition duration
в Carousel.module.scss.
*/
const TRANSITION_DURATION = 400

/**
Нормализация индекса.
*/
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
			height,
			collapsedWidth = 86,
			gap = 6,
			classNames
		},
		forwardedRef
	) => {
		const realCount = slides.length

		/**
		 * ------------------------------------------------------------
		 * DOM refs
		 * ------------------------------------------------------------
		 */
		const containerRef = useRef<HTMLDivElement | null>(null)
		const trackRef = useRef<HTMLDivElement | null>(null)

		/**
		 * ------------------------------------------------------------
		 * Transition refs
		 * ------------------------------------------------------------
		 */
		const isTransitioningRef = useRef(false)
		const transitionTimeoutRef = useRef<number | null>(null)

		/**
		 * Используется для ожидания reset.
		 */
		const resetFrameRef = useRef<number | null>(null)
		const resetSecondFrameRef = useRef<number | null>(null)

		/**
		 * ------------------------------------------------------------
		 * Controlled / uncontrolled
		 * ------------------------------------------------------------
		 */
		const isControlled = activeIndex !== undefined
		const initialIndex = normalizeIndex(
			isControlled ? (activeIndex ?? 0) : defaultActiveIndex,
			realCount
		)
		const [internalIndex, setInternalIndex] = useState(initialIndex)
		const currentIndex = isControlled
			? normalizeIndex(activeIndex ?? 0, realCount)
			: internalIndex

		/**
		 * ------------------------------------------------------------
		 * Physical position
		 * ------------------------------------------------------------
		 *
		 * ВАЖНО:
		 *
		 * displayPosition — физическая позиция
		 * в расширенном массиве.
		 *
		 * Например:
		 *
		 * 0 1 2 | 3 4 5 | 6 7 8 | 9 10 11 | 12 13 14
		 *
		 * 1 2 3 | 1 2 3 | 1 2 3 | 1  2  3 | 1  2  3
		 *                 ↑
		 *               центр
		 */
		const initialPosition = CENTER_COPY * realCount + initialIndex
		const [displayPosition, setDisplayPosition] = useState(initialPosition)

		/**
		 * Во время reset:
		 *
		 * - track transition = none
		 * - slide width transition = none
		 */
		const [isResetting, setIsResetting] = useState(false)

		/**
		 * ------------------------------------------------------------
		 * Container width
		 * ------------------------------------------------------------
		 */
		const [containerWidth, setContainerWidth] = useState(0)

		useLayoutEffect(() => {
			const node = containerRef.current
			if (!node) {
				return undefined
			}

			const updateWidth = () => {
				setContainerWidth(node.getBoundingClientRect().width)
			}

			updateWidth()

			const observer = new ResizeObserver(entries => {
				const width = entries[0]?.contentRect.width ?? 0
				setContainerWidth(width)
			})

			observer.observe(node)

			return () => {
				observer.disconnect()
			}
		}, [])

		/**
		 * ------------------------------------------------------------
		 * Extended slides
		 * ------------------------------------------------------------
		 */
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

		/**
		 * ------------------------------------------------------------
		 * Real index from physical position
		 * ------------------------------------------------------------
		 */
		const getRealIndex = useCallback(
			(position: number) => {
				return normalizeIndex(position, realCount)
			},
			[realCount]
		)

		/**
		 * ------------------------------------------------------------
		 * Active width
		 * ------------------------------------------------------------
		 */
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

		/**
		 * ------------------------------------------------------------
		 * Widths
		 * ------------------------------------------------------------
		 */
		const widths = useMemo(() => {
			return extendedSlides.map((_, index) => {
				return index === displayPosition ? activeWidth : collapsedWidth
			})
		}, [extendedSlides, displayPosition, activeWidth, collapsedWidth])

		/**
		 * ------------------------------------------------------------
		 * Track offset
		 * ------------------------------------------------------------
		 */
		const trackOffset = useMemo(() => {
			let offset = 0
			for (let index = 0; index < displayPosition; index += 1) {
				offset += widths[index] + gap * 2
			}
			return offset
		}, [widths, displayPosition, gap])

		/**
		 * ------------------------------------------------------------
		 * Clear animation handles
		 * ------------------------------------------------------------
		 */
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

		/**
		 * ------------------------------------------------------------
		 * RESET
		 * ------------------------------------------------------------
		 *
		 * Это ключевой участок исправления.
		 *
		 * Нельзя просто сделать:
		 *
		 * setDisplayPosition(center)
		 *
		 * потому что CSS transition у .track и .slide
		 * может воспринять reset как обычную анимацию.
		 *
		 * Поэтому:
		 *
		 * 1. включаем isResetting;
		 * 2. меняем физическую позицию;
		 * 3. React отрисовывает новую позицию;
		 * 4. принудительно читаем offsetWidth;
		 * 5. браузер фиксирует новое состояние;
		 * 6. только после этого включаем transition обратно.
		 */
		const resetToCenter = useCallback(
			(realIndex: number) => {
				if (realCount === 0) {
					isTransitioningRef.current = false
					return
				}

				const normalizedIndex = normalizeIndex(realIndex, realCount)
				const centerPosition = CENTER_COPY * realCount + normalizedIndex

				/**
				 * На время reset полностью отключаем
				 * все transitions.
				 */
				setIsResetting(true)

				/**
				 * Перемещаемся в центральную копию.
				 */
				setDisplayPosition(centerPosition)
			},
			[realCount]
		)

		/**
		 * ------------------------------------------------------------
		 * Завершение reset
		 * ------------------------------------------------------------
		 *
		 * useLayoutEffect гарантирует, что DOM уже обновлён
		 * до выполнения этой части.
		 */
		useLayoutEffect(() => {
			if (!isResetting) {
				return undefined
			}

			const track = trackRef.current
			if (!track) {
				setIsResetting(false)
				isTransitioningRef.current = false
				return undefined
			}

			/**
			 * КРИТИЧЕСКИ ВАЖНО.
			 *
			 * Принудительно заставляем браузер применить
			 * новое transform при transition: none.
			 */
			void track.offsetWidth

			resetFrameRef.current = requestAnimationFrame(() => {
				resetFrameRef.current = null

				/**
				 * Ещё один reflow.
				 *
				 * Это предотвращает ситуацию из видео,
				 * когда браузер сначала применяет reset,
				 * а затем проигрывает его как transition.
				 */
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

		/**
		 * ------------------------------------------------------------
		 * Finish transition
		 * ------------------------------------------------------------
		 */
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

				/**
				 * Сначала визуально завершаем transition,
				 * затем выполняем невидимый reset.
				 */
				resetToCenter(normalizedIndex)
			},
			[realCount, isControlled, onSlideChange, resetToCenter]
		)

		/**
		 * ------------------------------------------------------------
		 * Move to physical position
		 * ------------------------------------------------------------
		 */
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

				/**
				 * Обычная анимация.
				 *
				 * Здесь transition включен.
				 */
				setDisplayPosition(targetPosition)

				transitionTimeoutRef.current = window.setTimeout(() => {
					finishTransition(realIndex)
				}, TRANSITION_DURATION)
			},
			[realCount, displayPosition, getRealIndex, finishTransition]
		)

		/**
		 * ------------------------------------------------------------
		 * NEXT
		 * ------------------------------------------------------------
		 *
		 * Всегда физически +1.
		 *
		 * Поэтому:
		 *
		 * 3 → 1
		 *
		 * идёт вправо.
		 */
		const moveNext = useCallback(() => {
			if (realCount === 0 || isTransitioningRef.current) {
				return
			}

			const targetPosition = displayPosition + 1

			moveToPosition(targetPosition, getRealIndex(targetPosition))
		}, [realCount, displayPosition, getRealIndex, moveToPosition])

		/**
		 * ------------------------------------------------------------
		 * PREVIOUS
		 * ------------------------------------------------------------
		 */
		const movePrev = useCallback(() => {
			if (realCount === 0 || isTransitioningRef.current) {
				return
			}

			const targetPosition = displayPosition - 1

			moveToPosition(targetPosition, getRealIndex(targetPosition))
		}, [realCount, displayPosition, getRealIndex, moveToPosition])

		/**
		 * ------------------------------------------------------------
		 * Click по слайду
		 * ------------------------------------------------------------
		 *
		 * ВАЖНО:
		 *
		 * Передаём физическую позицию.
		 *
		 * Поэтому если справа находится:
		 *
		 * [3] [1] [2]
		 *
		 * и пользователь нажимает на [1],
		 * карусель идёт именно к этой физической [1].
		 */
		const handleSlideClick = useCallback(
			(position: number) => {
				if (isTransitioningRef.current) {
					return
				}

				/**
				 * Клик по уже раскрытому слайду
				 * ничего не делает.
				 */
				if (position === displayPosition) {
					return
				}

				const realIndex = getRealIndex(position)

				/**
				 * Переходим именно к той физической копии,
				 * по которой был сделан клик.
				 *
				 * Это важно для бесконечной карусели:
				 *
				 * 3 | 1 | 2
				 *     ↑
				 *     клик
				 *
				 * должна открыться именно эта 1,
				 * а не другая копия 1 в массиве.
				 */
				moveToPosition(position, realIndex)
			},
			[displayPosition, getRealIndex, moveToPosition]
		)

		/**
		 * ------------------------------------------------------------
		 * Controlled mode
		 * ------------------------------------------------------------
		 */
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

			/**
			 * Это изменение activeIndex пришло
			 * во время нашей собственной анимации.
			 *
			 * Вмешиваться нельзя.
			 */
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

			/**
			 * Внешнее изменение activeIndex.
			 */
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

		/**
		 * ------------------------------------------------------------
		 * Изменение количества slides
		 * ------------------------------------------------------------
		 */
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

		/**
		 * ------------------------------------------------------------
		 * Autoplay
		 * ------------------------------------------------------------
		 */
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

		/**
		 * ------------------------------------------------------------
		 * Cleanup
		 * ------------------------------------------------------------
		 */
		useEffect(() => {
			return () => {
				clearAnimationHandles()
			}
		}, [clearAnimationHandles])

		/**
		 * ------------------------------------------------------------
		 * Empty state
		 * ------------------------------------------------------------
		 */
		if (realCount === 0) {
			return (
				<div
					ref={forwardedRef}
					className={[styles.carousel, classNames]
						.filter(Boolean)
						.join(' ')}
					style={height ? { height } : undefined}
				/>
			)
		}

		/**
		 * ------------------------------------------------------------
		 * Render
		 * ------------------------------------------------------------
		 */
		return (
			<div
				ref={forwardedRef}
				className={[styles.carousel, classNames]
					.filter(Boolean)
					.join(' ')}
				style={height ? { height } : undefined}
			>
				<div ref={containerRef} className={styles.viewport}>
					<div
						ref={trackRef}
						role='list'
						className={styles.track}
						style={{
							transform: `translate3d(${-trackOffset}px, 0, 0)`,
							transition: isResetting
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
								style={{
									width: widths[index],
									margin: `0 ${gap}px`,
									transition: isResetting ? 'none' : undefined
								}}
								onClick={() => handleSlideClick(index)}
							>
								{slide.content}
							</div>
						))}
					</div>
				</div>

				{showArrows ? (
					<>
						<button
							type='button'
							className={styles.arrow}
							data-side='prev'
							aria-label='Предыдущий слайд'
							onClick={movePrev}
						>
							<ChevronIcon />
						</button>

						<button
							type='button'
							className={styles.arrow}
							data-side='next'
							aria-label='Следующий слайд'
							onClick={moveNext}
						>
							<ChevronIcon />
						</button>
					</>
				) : null}
			</div>
		)
	}
)

Carousel.displayName = 'Carousel'
