import {
	Children,
	createContext,
	isValidElement,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type PointerEvent as ReactPointerEvent,
	type ReactElement,
	type ReactNode
} from 'react'
import { flushSync } from 'react-dom'

import styles from './DragArea.module.scss'

export interface DragOrderChange {
	activeId: string
	order: string[]
}

export interface DragElementProps {
	id: string
	children: ReactNode
	disabled?: boolean
	/** Element stays in its slot and is excluded from sorting. */
	locked?: boolean
	className?: string
	style?: CSSProperties
	onDragStart?: (id: string) => void
	onDragEnd?: (
		id: string,
		event: { cancelled: boolean; order: string[] }
	) => void
}

export interface DragAreaProps {
	/** Pass only DragElement children. Sorting state is fully owned by DragArea. */
	children: ReactElement<DragElementProps> | ReactElement<DragElementProps>[]
	columns?: number | 'auto'
	gap?: number
	rowGap?: number
	columnGap?: number
	className?: string
	style?: CSSProperties
	onOrderChange?: (order: string[], activeId: string) => void
}

interface RegisteredItem {
	id: string
	element: HTMLElement
	locked: boolean
	onDragStart?: (id: string) => void
	onDragEnd?: (id: string, event: { cancelled: boolean; order: string[] }) => void
}

interface Slot {
	left: number
	top: number
	width: number
	height: number
	centerX: number
	centerY: number
}

interface DragContextValue {
	register: (
		id: string,
		element: HTMLElement | null,
		locked: boolean,
		callbacks?: Pick<RegisteredItem, 'onDragStart' | 'onDragEnd'>
	) => void
	start: (id: string, event: PointerEvent) => void
	activeId: string | null
}

const DragContext = createContext<DragContextValue | null>(null)

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value))

const DROP_TRANSITION_MS = 180

const useDragContext = () => {
	const context = useContext(DragContext)
	if (!context) throw new Error('DragElement must be used inside <DragArea>')
	return context
}

const getDragElements = (children: ReactNode) =>
	Children.toArray(children).filter(
		(child): child is ReactElement<DragElementProps> =>
			isValidElement<DragElementProps>(child) && typeof child.props.id === 'string'
	)

export const DragArea = ({
	children,
	columns = 'auto',
	gap = 12,
	rowGap,
	columnGap,
	className,
	style,
	onOrderChange
}: DragAreaProps) => {
	const areaRef = useRef<HTMLDivElement | null>(null)
	const itemsRef = useRef(new Map<string, RegisteredItem>())
	const layoutRef = useRef(new Map<string, Slot>())
	const slotsRef = useRef<Slot[]>([])
	const orderRef = useRef<string[]>([])
	const activeIdRef = useRef<string | null>(null)
	const activePointerIdRef = useRef<number | null>(null)
	const activeSlotRef = useRef(-1)
	const startOrderRef = useRef<string[]>([])
	const pointerOffsetRef = useRef({ x: 0, y: 0 })
	const rafRef = useRef<number | null>(null)
	const dropTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const pendingPointerRef = useRef<PointerEvent | null>(null)
	const listenersAttachedRef = useRef(false)
	const handlersRef = useRef<{
		move: (event: PointerEvent) => void
		up: (event: PointerEvent) => void
		cancel: (event: PointerEvent) => void
	}>({
		move: () => undefined,
		up: () => undefined,
		cancel: () => undefined
	})

	const elements = getDragElements(children)
	const [order, setOrder] = useState(() => elements.map(element => element.props.id))
	const [activeId, setActiveId] = useState<string | null>(null)

	// React is the source of truth for the final order. External code does not
	// need to maintain or reorder an array just to use DragArea.
	useEffect(() => {
		const incomingIds = elements.map(element => element.props.id)
		setOrder(current => {
			const incoming = new Set(incomingIds)
			const preserved = current.filter(id => incoming.has(id))
			const added = incomingIds.filter(id => !current.includes(id))
			const next = [...preserved, ...added]
			return next.length === current.length && next.every((id, i) => id === current[i])
				? current
				: next
		})
	}, [children])

	useEffect(() => {
		orderRef.current = order
	}, [order])

	const register = useCallback<DragContextValue['register']>(
		(id, element, locked, callbacks) => {
			if (!element) {
				itemsRef.current.delete(id)
				return
			}
			itemsRef.current.set(id, { id, element, locked, ...callbacks })
		},
		[]
	)

	const clearTransforms = useCallback(() => {
		for (const item of itemsRef.current.values()) {
			item.element.style.removeProperty('--drag-area-x')
			item.element.style.removeProperty('--drag-area-y')
		}
	}, [])

	const captureLayout = useCallback(() => {
		const layout = new Map<string, Slot>()
		for (const id of orderRef.current) {
			const item = itemsRef.current.get(id)
			if (!item) continue
			const rect = item.element.getBoundingClientRect()
			layout.set(id, {
				left: rect.left,
				top: rect.top,
				width: rect.width,
				height: rect.height,
				centerX: rect.left + rect.width / 2,
				centerY: rect.top + rect.height / 2
			})
		}
		layoutRef.current = layout
		slotsRef.current = orderRef.current
			.filter(id => !itemsRef.current.get(id)?.locked)
			.map(id => layout.get(id))
			.filter((slot): slot is Slot => Boolean(slot))
			.sort((a, b) => a.top - b.top || a.left - b.left)
	}, [])

	const getTargetSlot = useCallback((event: PointerEvent) => {
		const active = activeIdRef.current
		const origin = layoutRef.current.get(active ?? '')
		const slots = slotsRef.current
		if (!active || !origin || !slots.length) return -1

		const centerX = event.clientX - pointerOffsetRef.current.x + origin.width / 2
		const centerY = event.clientY - pointerOffsetRef.current.y + origin.height / 2

		let target = 0
		let best = Infinity
		for (let i = 0; i < slots.length; i += 1) {
			const slot = slots[i]
			const score = Math.abs(centerY - slot.centerY) * 1.75 + Math.abs(centerX - slot.centerX)
			if (score < best) {
				best = score
				target = i
			}
		}
		return target
	}, [])

	const moveActive = useCallback((event: PointerEvent) => {
		const activeId = activeIdRef.current
		const item = activeId ? itemsRef.current.get(activeId) : null
		const origin = layoutRef.current.get(activeId ?? '')
		const area = areaRef.current
		if (!item || !origin || !area) return

		const areaRect = area.getBoundingClientRect()
		const left = clamp(
			event.clientX - pointerOffsetRef.current.x,
			areaRect.left,
			Math.max(areaRect.left, areaRect.right - origin.width)
		)
		const top = clamp(
			event.clientY - pointerOffsetRef.current.y,
			areaRect.top,
			Math.max(areaRect.top, areaRect.bottom - origin.height)
		)

		item.element.style.setProperty('--drag-area-x', `${left - origin.left}px`)
		item.element.style.setProperty('--drag-area-y', `${top - origin.top}px`)
	}, [])

	const shiftSiblings = useCallback((target: number) => {
		const activeId = activeIdRef.current
		if (!activeId) return

		const sortableIds = orderRef.current.filter(id => !itemsRef.current.get(id)?.locked)
		const from = sortableIds.indexOf(activeId)
		if (from < 0) return

		const destination = clamp(target, 0, sortableIds.length - 1)
		if (destination === activeSlotRef.current) return

		const virtual = [...sortableIds]
		virtual.splice(from, 1)
		virtual.splice(destination, 0, activeId)

		for (let i = 0; i < virtual.length; i += 1) {
			const id = virtual[i]
			if (id === activeId) continue
			const item = itemsRef.current.get(id)
			const fromSlot = layoutRef.current.get(id)
			const toSlot = slotsRef.current[i]
			if (!item || !fromSlot || !toSlot) continue
			item.element.style.setProperty('--drag-area-x', `${toSlot.left - fromSlot.left}px`)
			item.element.style.setProperty('--drag-area-y', `${toSlot.top - fromSlot.top}px`)
		}

		activeSlotRef.current = destination
	}, [])

	const detachListeners = useCallback(() => {
		if (!listenersAttachedRef.current) return
		window.removeEventListener('pointermove', handlersRef.current.move)
		window.removeEventListener('pointerup', handlersRef.current.up)
		window.removeEventListener('pointercancel', handlersRef.current.cancel)
		listenersAttachedRef.current = false
	}, [])

	const finish = useCallback((cancelled: boolean) => {
		const activeId = activeIdRef.current
		if (!activeId) return

		detachListeners()
		if (rafRef.current !== null) {
			cancelAnimationFrame(rafRef.current)
			rafRef.current = null
		}

		const sortable = orderRef.current.filter(id => !itemsRef.current.get(id)?.locked)
		const from = sortable.indexOf(activeId)
		const to = activeSlotRef.current
		let nextOrder = [...startOrderRef.current]

		if (!cancelled && from >= 0 && to >= 0 && from !== to) {
			const nextSortable = [...sortable]
			const [moved] = nextSortable.splice(from, 1)
			nextSortable.splice(to, 0, moved)
			let index = 0
			nextOrder = startOrderRef.current.map(id =>
				itemsRef.current.get(id)?.locked ? id : nextSortable[index++]
			)
		}

		const item = itemsRef.current.get(activeId)
		item?.element.releasePointerCapture?.(activePointerIdRef.current ?? -1)

		const changed = nextOrder.join('\0') !== startOrderRef.current.join('\0')
		const destination = cancelled
			? layoutRef.current.get(activeId)
			: slotsRef.current[clamp(to, 0, Math.max(0, slotsRef.current.length - 1))]
		const origin = layoutRef.current.get(activeId)

		activeIdRef.current = null
		activePointerIdRef.current = null
		setActiveId(null)

		if (item && origin && destination) {
			// The active class disables transitions while following the pointer.
			// Remove it before changing the transform so the release animates to the slot.
			item.element.classList.remove(styles.active)
			void item.element.offsetWidth
			item.element.style.setProperty('--drag-area-x', `${destination.left - origin.left}px`)
			item.element.style.setProperty('--drag-area-y', `${destination.top - origin.top}px`)
		}

		dropTimeoutRef.current = setTimeout(() => {
			dropTimeoutRef.current = null
			orderRef.current = nextOrder
			if (!cancelled && changed) {
				// Commit the new grid positions before removing the FLIP offsets.
				// Keeping both operations in the same frame prevents the reordered
				// elements from being painted once with transforms from the old layout.
				flushSync(() => setOrder(nextOrder))
				const area = areaRef.current
				area?.classList.add(styles.settling)
				clearTransforms()
				if (area) void area.offsetWidth
				area?.classList.remove(styles.settling)
				onOrderChange?.(nextOrder, activeId)
			} else {
				clearTransforms()
			}
			item?.onDragEnd?.(activeId, { cancelled, order: nextOrder })
		}, DROP_TRANSITION_MS)
	}, [clearTransforms, detachListeners, onOrderChange])

	const pointerMove = useCallback((event: PointerEvent) => {
		if (!activeIdRef.current || event.pointerId !== activePointerIdRef.current) return
		pendingPointerRef.current = event
		if (rafRef.current !== null) return

		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null
			const pointer = pendingPointerRef.current
			if (!pointer || !activeIdRef.current) return
			moveActive(pointer)
			shiftSiblings(getTargetSlot(pointer))
		})
	}, [getTargetSlot, moveActive, shiftSiblings])

	const pointerUp = useCallback((event: PointerEvent) => {
		if (event.pointerId === activePointerIdRef.current) finish(false)
	}, [finish])

	const pointerCancel = useCallback((event: PointerEvent) => {
		if (event.pointerId === activePointerIdRef.current) finish(true)
	}, [finish])

	handlersRef.current.move = pointerMove
	handlersRef.current.up = pointerUp
	handlersRef.current.cancel = pointerCancel

	const start = useCallback<DragContextValue['start']>((id, event) => {
		const item = itemsRef.current.get(id)
		const area = areaRef.current
		if (!item || item.locked || !area || activeIdRef.current || dropTimeoutRef.current) return

		const rect = item.element.getBoundingClientRect()
		activeIdRef.current = id
		activePointerIdRef.current = event.pointerId
		activeSlotRef.current = -1
		startOrderRef.current = [...orderRef.current]
		pointerOffsetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }

		captureLayout()
		activeSlotRef.current = orderRef.current
			.filter(itemId => !itemsRef.current.get(itemId)?.locked)
			.indexOf(id)

		item.onDragStart?.(id)
		setActiveId(id)
		item.element.setPointerCapture?.(event.pointerId)

		window.addEventListener('pointermove', handlersRef.current.move)
		window.addEventListener('pointerup', handlersRef.current.up)
		window.addEventListener('pointercancel', handlersRef.current.cancel)
		listenersAttachedRef.current = true
	}, [captureLayout])

	useEffect(() => {
		if (columns !== 'auto') return
		const area = areaRef.current
		if (!area) return
		const update = () => {
			const first = orderRef.current.map(id => itemsRef.current.get(id)?.element).find(Boolean)
			if (!first) return
			const width = first.getBoundingClientRect().width
			if (!width) return
			const gapValue = columnGap ?? gap
			const count = Math.max(1, Math.floor((area.clientWidth + gapValue) / (width + gapValue)))
			area.style.setProperty('--drag-area-columns', String(count))
		}
		update()
		const observer = new ResizeObserver(update)
		observer.observe(area)
		return () => observer.disconnect()
	}, [children, columnGap, columns, gap])

	useEffect(() => () => {
		if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
		if (dropTimeoutRef.current !== null) clearTimeout(dropTimeoutRef.current)
		detachListeners()
		clearTransforms()
	}, [clearTransforms, detachListeners])

	const childrenById = useMemo(() => {
		const map = new Map<string, ReactElement<DragElementProps>>()
		for (const element of elements) map.set(element.props.id, element)
		return map
	}, [children])

	const renderedChildren = order
		.map(id => childrenById.get(id))
		.filter((element): element is ReactElement<DragElementProps> => Boolean(element))

	const context = useMemo<DragContextValue>(
		() => ({ register, start, activeId }),
		[activeId, register, start]
	)

	return (
		<DragContext.Provider value={context}>
			<div
				ref={areaRef}
				className={[styles.area, className].filter(Boolean).join(' ')}
				style={{
					...style,
					'--drag-area-columns': columns === 'auto' ? 'auto' : columns,
					'--drag-area-row-gap': `${rowGap ?? gap}px`,
					'--drag-area-column-gap': `${columnGap ?? gap}px`
				} as CSSProperties}
			>
				{renderedChildren}
			</div>
		</DragContext.Provider>
	)
}

export const DragElement = ({
	id,
	children,
	disabled = false,
	locked = false,
	className,
	style,
	onDragStart,
	onDragEnd
}: DragElementProps) => {
	const wrapperRef = useRef<HTMLDivElement | null>(null)
	const { register, start, activeId } = useDragContext()

	useEffect(() => {
		register(id, wrapperRef.current, disabled || locked, { onDragStart, onDragEnd })
		return () => register(id, null, disabled || locked)
	}, [disabled, id, locked, onDragEnd, onDragStart, register])

	useEffect(() => {
		const wrapper = wrapperRef.current
		const child = wrapper?.firstElementChild
		if (!(child instanceof HTMLElement) || !wrapper) return

		const syncSize = () => {
			const rect = child.getBoundingClientRect()
			wrapper.style.width = `${rect.width}px`
			wrapper.style.height = `${rect.height}px`
		}
		syncSize()
		const observer = new ResizeObserver(syncSize)
		observer.observe(child)
		return () => observer.disconnect()
	}, [children])

	const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
		if (disabled || locked || event.button !== 0) return
		event.preventDefault()
		start(id, event.nativeEvent)
	}

	return (
		<div
			ref={wrapperRef}
			className={[styles.item, activeId === id ? styles.active : '', className ?? '']
				.filter(Boolean)
				.join(' ')}
			style={style}
			onPointerDown={handlePointerDown}
			data-drag-id={id}
			data-drag-locked={disabled || locked ? 'true' : undefined}
		>
			{children}
		</div>
	)
}
