import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type FunctionComponent,
    type ReactNode,
} from 'react'
import styles from './ExpandableCard.module.scss'

interface ExpandableCardContextValue {
    expanded: boolean
    transitionDuration: string
}

const ExpandableCardContext = createContext<ExpandableCardContextValue | null>(null)

const useExpandableCardContext = () => {
    const context = useContext(ExpandableCardContext)

    if (!context) {
        throw new Error(
            'ExpandableCard.* components must be used inside <ExpandableCard>.',
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

export interface ExpandableCardProps
    extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
    children?: ReactNode
    width?: number | string
    height?: number | string
    expandedWidth?: number | string
    expandedHeight?: number | string
    showDelay?: number
    animationDuration?: number
    disabled?: boolean
}

export interface ExpandableCardSlotProps
    extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
}

type ExpandableCardSlotComponent = FunctionComponent<ExpandableCardSlotProps>

const createSlot = (
    slotClassName: string,
): ExpandableCardSlotComponent => {
    const Slot: ExpandableCardSlotComponent = ({
        className,
        children,
        style,
        ...props
    }) => {
        const { transitionDuration } = useExpandableCardContext()

        return (
            <div
                {...props}
                className={cx(slotClassName, className)}
                style={{
                    ...style,
                    transitionDuration,
                }}
            >
                {children}
            </div>
        )
    }

    return Slot
}

const Icon = createSlot(styles.icon)
const Title = createSlot(styles.title)
const Subtitle = createSlot(styles.subtitle)
const Collapsed = createSlot(styles.collapsedContent)
const CollapsedFooter = createSlot(styles.collapsedFooter)
const Action = createSlot(styles.action)
const Content = createSlot(styles.content)
const Footer = createSlot(styles.footer)
const Free = createSlot(styles.free)

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
    onFocus,
    onBlur,
    ...props
}: ExpandableCardProps) => {
    const [expanded, setExpanded] = useState(false)
    const timerRef = useRef<number | null>(null)

    const clearTimer = () => {
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }

    const open = () => {
        if (disabled) return

        clearTimer()

        timerRef.current = window.setTimeout(() => {
            setExpanded(true)
            timerRef.current = null
        }, Math.max(0, showDelay))
    }

    const close = () => {
        clearTimer()
        setExpanded(false)
    }

    useEffect(() => () => clearTimer(), [])

    const cardWidth = toCssSize(width, '166px')
    const cardHeight = toCssSize(height, '220px')
    const cardExpandedWidth = toCssSize(expandedWidth, '318px')
    const cardExpandedHeight = toCssSize(expandedHeight, '398px')
    const transitionDuration = `${animationDuration}ms`

    const wrapperStyle: CSSProperties = {
        width: cardWidth,
        height: cardHeight,
        flex: `0 0 ${cardWidth}`,
    }

    const cardStyle: CSSProperties = {
        width: expanded ? cardExpandedWidth : cardWidth,
        height: expanded ? cardExpandedHeight : cardHeight,
        transitionDuration,
        ...style,
    }

    return (
        <div className={styles.wrapper} style={wrapperStyle}>
            <article
                {...props}
                className={cx(styles.card, expanded && styles.expanded, className)}
                style={cardStyle}
                data-expanded={expanded}
                aria-expanded={expanded}
                onMouseEnter={(event) => {
                    open()
                    onMouseEnter?.(event)
                }}
                onMouseLeave={(event) => {
                    close()
                    onMouseLeave?.(event)
                }}
                onFocus={(event) => {
                    open()
                    onFocus?.(event)
                }}
                onBlur={(event) => {
                    if (
                        !event.currentTarget.contains(
                            event.relatedTarget as Node | null,
                        )
                    ) {
                        close()
                    }

                    onBlur?.(event)
                }}
            >
                <ExpandableCardContext.Provider
                    value={{ expanded, transitionDuration }}
                >
                    {children}
                </ExpandableCardContext.Provider>
            </article>
        </div>
    )
}

export interface ExpandableCardComponent
    extends FunctionComponent<ExpandableCardProps> {
    Icon: ExpandableCardSlotComponent
    Title: ExpandableCardSlotComponent
    Subtitle: ExpandableCardSlotComponent
    Collapsed: ExpandableCardSlotComponent
    CollapsedFooter: ExpandableCardSlotComponent
    Action: ExpandableCardSlotComponent
    Content: ExpandableCardSlotComponent
    Footer: ExpandableCardSlotComponent
    Free: ExpandableCardSlotComponent
}

export const ExpandableCard = ExpandableCardBase as ExpandableCardComponent

ExpandableCard.displayName = 'ExpandableCard'
ExpandableCard.Icon = Icon
ExpandableCard.Icon.displayName = 'ExpandableCard.Icon'
ExpandableCard.Title = Title
ExpandableCard.Title.displayName = 'ExpandableCard.Title'
ExpandableCard.Subtitle = Subtitle
ExpandableCard.Subtitle.displayName = 'ExpandableCard.Subtitle'
ExpandableCard.Collapsed = Collapsed
ExpandableCard.Collapsed.displayName = 'ExpandableCard.Collapsed'
ExpandableCard.CollapsedFooter = CollapsedFooter
ExpandableCard.CollapsedFooter.displayName = 'ExpandableCard.CollapsedFooter'
ExpandableCard.Action = Action
ExpandableCard.Action.displayName = 'ExpandableCard.Action'
ExpandableCard.Content = Content
ExpandableCard.Content.displayName = 'ExpandableCard.Content'
ExpandableCard.Footer = Footer
ExpandableCard.Footer.displayName = 'ExpandableCard.Footer'
ExpandableCard.Free = Free
ExpandableCard.Free.displayName = 'ExpandableCard.Free'

export {
    Icon as ExpandableCardIcon,
    Title as ExpandableCardTitle,
    Subtitle as ExpandableCardSubtitle,
    Collapsed as ExpandableCardCollapsed,
    CollapsedFooter as ExpandableCardCollapsedFooter,
    Action as ExpandableCardAction,
    Content as ExpandableCardContent,
    Footer as ExpandableCardFooter,
    Free as ExpandableCardFree,
}
