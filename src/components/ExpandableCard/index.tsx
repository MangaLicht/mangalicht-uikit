import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	type CSSProperties,
	type HTMLAttributes,
	type FunctionComponent,
	type PointerEvent as ReactPointerEvent,
	type ReactNode
} from 'react'
import styles from './ExpandableCard.module.scss'

interface ExpandableCardContextValue {
	expanded: boolean
	transitionDuration: string
}

const ExpandableCardContext = createContext<ExpandableCardContextValue | null>(
	null
)

const useExpandableCardContext = () => {
	const context = useContext(ExpandableCardContext)

	if (!context) {
		throw new Error(
			'ExpandableCard.ExpandableElement must be used inside <ExpandableCard>.'
		)
	}

	return context
}

const cx = (...values: Array<string | undefined | false>) =>
	values.filter(Boolean).join(' ')

const toCssSize = (value: number | string | undefined, fallback: string) => {
	if (value == null) return fallback

	return typeof value === 'number' ? `${value}px` : value
}

export interface ExpandableCardProps extends Omit<
	HTMLAttributes<HTMLElement>,
	'children'
> {
	children?: ReactNode

	width?: number | string
	height?: number | string

	expandedWidth?: number | string
	expandedHeight?: number | string

	showDelay?: number
	animationDuration?: number

	disabled?: boolean
}

export interface ExpandableElementProps extends HTMLAttributes<HTMLDivElement> {
	children?: ReactNode

	initialClassName?: string
	expandedClassName?: string
}

export type ExpandableElementComponent =
	FunctionComponent<ExpandableElementProps>

const ExpandableElement: ExpandableElementComponent = ({
	className,
	children,
	style,
	initialClassName,
	expandedClassName,
	...props
}) => {
	const { expanded, transitionDuration } = useExpandableCardContext()

	return (
		<div
			{...props}
			className={cx(
				styles.element,
				expanded ? expandedClassName : initialClassName,
				className
			)}
			style={{
				...style,
				transitionDuration
			}}
		>
			{children}
		</div>
	)
}

ExpandableElement.displayName = 'ExpandableCard.ExpandableElement'

const MOBILE_DOUBLE_TAP_DELAY = 320

const ExpandableCardBase = ({
	children,

	width = 166,
	height = 220,

	expandedWidth = 318,
	expandedHeight = 398,

	showDelay = 700,
	animationDuration = 360,

	disabled = false,

	className,
	style,

	onMouseEnter,
	onMouseLeave,

	onPointerEnter,
	onPointerLeave,
	onPointerDown,
	onPointerUp,

	onFocus,
	onBlur,

	onDoubleClick,

	...props
}: ExpandableCardProps) => {
	const [expanded, setExpanded] = useState(false)

	const timerRef = useRef<number | null>(null)

	const cardRef = useRef<HTMLElement | null>(null)

	// Время последнего touch-события используется
	// для определения двойного тапа.
	const lastTouchRef = useRef(0)

	// Запоминаем тип последнего pointer-события,
	// чтобы touch не запускал desktop hover/focus.
	const lastPointerTypeRef = useRef<'mouse' | 'touch' | 'pen' | null>(null)

	const clearTimer = () => {
		if (timerRef.current !== null) {
			window.clearTimeout(timerRef.current)
			timerRef.current = null
		}
	}

	const openImmediately = () => {
		if (disabled) return

		clearTimer()
		setExpanded(true)
	}

	const open = () => {
		if (disabled) return

		clearTimer()

		timerRef.current = window.setTimeout(
			() => {
				setExpanded(true)
				timerRef.current = null
			},
			Math.max(0, showDelay)
		)
	}

	const close = () => {
		clearTimer()
		setExpanded(false)
	}

	/*
	 * MOBILE DOUBLE TAP
	 *
	 * Первый tap ничего не делает.
	 *
	 * Если второй tap происходит в пределах
	 * MOBILE_DOUBLE_TAP_DELAY, карточка раскрывается
	 * сразу, без showDelay.
	 */
	const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
		if (disabled || expanded || event.pointerType !== 'touch') {
			return
		}

		const now = Date.now()

		const isDoubleTap =
			now - lastTouchRef.current <= MOBILE_DOUBLE_TAP_DELAY

		if (isDoubleTap) {
			lastTouchRef.current = 0

			openImmediately()

			return
		}

		lastTouchRef.current = now
	}

	/*
	 * CLICK OUTSIDE
	 *
	 * Listener существует только пока карточка раскрыта.
	 *
	 * Если pointerdown произошёл вне article,
	 * карточка закрывается.
	 *
	 * Listener обязательно удаляется при закрытии
	 * карточки и при размонтировании компонента.
	 */
	useEffect(() => {
		if (!expanded || disabled) {
			return undefined
		}

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target

			if (target instanceof Node && !cardRef.current?.contains(target)) {
				clearTimer()
				setExpanded(false)
			}
		}

		document.addEventListener('pointerdown', handlePointerDown)

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown)
		}
	}, [expanded, disabled])

	/*
	 * Очистка таймера и touch-состояния
	 * при размонтировании компонента.
	 */
	useEffect(() => {
		return () => {
			clearTimer()

			lastTouchRef.current = 0
			lastPointerTypeRef.current = null
		}
	}, [])

	const cardWidth = toCssSize(width, '166px')

	const cardHeight = toCssSize(height, '220px')

	const cardExpandedWidth = toCssSize(expandedWidth, '318px')

	const cardExpandedHeight = toCssSize(expandedHeight, '398px')

	const transitionDuration = `${animationDuration}ms`

	const wrapperStyle: CSSProperties = {
		width: cardWidth,
		height: cardHeight,
		flex: `0 0 ${cardWidth}`
	}

	const cardStyle: CSSProperties = {
		width: expanded ? cardExpandedWidth : cardWidth,

		height: expanded ? cardExpandedHeight : cardHeight,

		transitionDuration,

		...style
	}

	return (
		<div className={styles.wrapper} style={wrapperStyle}>
			<article
				{...props}
				ref={cardRef}
				className={cx(
					styles.card,
					expanded && styles.expanded,
					className
				)}
				style={cardStyle}
				data-expanded={expanded}
				aria-expanded={expanded}
				/*
				 * Запоминаем тип взаимодействия.
				 *
				 * Это необходимо, чтобы touch не запускал
				 * desktop hover/focus behaviour.
				 */
				onPointerDown={event => {
					lastPointerTypeRef.current = event.pointerType

					onPointerDown?.(event)
				}}
				/*
				 * Обработка двойного тапа.
				 */
				onPointerUp={event => {
					handlePointerUp(event)

					onPointerUp?.(event)
				}}
				/*
				 * Desktop hover.
				 *
				 * Touch намеренно игнорируется.
				 */
				onPointerEnter={event => {
					if (event.pointerType === 'mouse') {
						open()
					}

					onPointerEnter?.(event)
				}}
				onPointerLeave={event => {
					if (event.pointerType === 'mouse') {
						close()
					}

					onPointerLeave?.(event)
				}}
				/*
				 * Старые mouse callbacks сохраняются
				 * для обратной совместимости API.
				 */
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				/*
				 * Keyboard focus продолжает открывать
				 * карточку.
				 *
				 * Touch-generated focus игнорируется,
				 * иначе первый tap мог бы открыть карточку
				 * через showDelay.
				 */
				onFocus={event => {
					if (lastPointerTypeRef.current !== 'touch') {
						open()
					}

					onFocus?.(event)
				}}
				onBlur={event => {
					if (
						!event.currentTarget.contains(
							event.relatedTarget as Node | null
						)
					) {
						close()
					}

					onBlur?.(event)
				}}
				/*
				 * Desktop native double-click.
				 *
				 * Для touch используется собственная
				 * обработка через pointerup.
				 */
				onDoubleClick={event => {
					if (!expanded && lastPointerTypeRef.current !== 'touch') {
						openImmediately()
					}

					onDoubleClick?.(event)
				}}
			>
				<ExpandableCardContext.Provider
					value={{
						expanded,
						transitionDuration
					}}
				>
					{children}
				</ExpandableCardContext.Provider>
			</article>
		</div>
	)
}

export interface ExpandableCardComponent extends FunctionComponent<ExpandableCardProps> {
	ExpandableElement: ExpandableElementComponent
}

export const ExpandableCard = ExpandableCardBase as ExpandableCardComponent

ExpandableCard.displayName = 'ExpandableCard'

ExpandableCard.ExpandableElement = ExpandableElement

export { ExpandableElement }
