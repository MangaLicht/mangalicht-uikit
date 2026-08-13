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
            'ExpandableCard.ExpandableElenent must be used inside <ExpandableCard>.',
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

export interface ExpandableElenentProps
    extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
    initialClassName?: string
    expandedClassName?: string
}

export type ExpandableElenentComponent = FunctionComponent<ExpandableElenentProps>

const ExpandableElenent: ExpandableElenentComponent = ({
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
                className,
            )}
            style={{
                ...style,
                transitionDuration,
            }}
        >
            {children}
        </div>
    )
}

ExpandableElenent.displayName = 'ExpandableCard.ExpandableElenent'


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
    ExpandableElenent: ExpandableElenentComponent
}

export const ExpandableCard = ExpandableCardBase as ExpandableCardComponent

ExpandableCard.displayName = 'ExpandableCard'
ExpandableCard.ExpandableElenent = ExpandableElenent

export { ExpandableElenent }
