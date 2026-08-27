import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type PointerEvent as ReactPointerEvent,
	type ReactNode
} from 'react'

import styles from './DragArea.module.scss'

export interface DragOrderChange {
	activeId: string
	order: string[]
}

export interface DragAreaProps {
	children: ReactNode
	columns?: number | 'auto'
	gap?: number
	rowGap?: number
	columnGap?: number
	onOrderChange?: (order: string[], activeId: string) => void
	className?: string
	style?: CSSProperties
}

export interface DragElementProps {
	id: string
	children: ReactNode
	disabled?: boolean
	/** Keeps the item in its grid slot; it can neither be dragged nor sorted around. */
	locked?: boolean
	className?: string
	style?: CSSProperties
	onDragStart?: (id: string) => void
	onDragEnd?: (
		id: string,
		event: { cancelled: boolean; order: string[] }
	) => void
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

interface DragAreaContextValue {
	register: (
		id: string,
		element: HTMLElement | null,
		locked: boolean,
		callbacks?: {
			onDragStart?: (id: string) => void
			onDragEnd?: (id: string, event: { cancelled: boolean; order: string[] }) => void
		}
	) => void
	start: (id: string, event: PointerEvent) => void
	activeId: string | null
	isDragging: boolean
}

const DragAreaContext = createContext<DragAreaContextValue | null>(null)

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value))

const useDragAreaContext = () => {
	const context = useContext(DragAreaContext)
	if (!context) {
		throw new Error('DragElement must be used inside <DragArea>')
	}
	return context
}

export const DragArea = ({
	children,
	columns = 'auto',
	gap = 12,
	rowGap,
	columnGap,
	onOrderChange,
	className,
	style
}: DragAreaProps) => {
	const areaRef = useRef<HTMLDivElement | null>(null)
	const itemsRef = useRef(new Map<string, RegisteredItem>())
	const orderRef = useRef<string[]>([])
	const activeIdRef = useRef<string | null>(null)
	const activePointerIdRef = useRef<number | null>(null)
	const activeSlotRef = useRef(-1)
	const startOrderRef = useRef<string[]>([])
	const layoutRef = useRef(new Map<string, Slot>())
	const sortableSlotsRef = useRef<Slot[]>([])
	const pointerOffsetRef = useRef({ x: 0, y: 0 })
	const rafRef = useRef<number | null>(null)
	const pendingPointerRef = useRef<PointerEvent | null>(null)
	const listenersRef = useRef(false)
	const [activeId, setActiveId] = useState<string | null>(null)

	const register = useCallback(
		(id: string, element: HTMLElement | null, locked: boolean, callbacks) => {
			if (!element) {
				itemsRef.current.delete(id)
				orderRef.current = orderRef.current.filter(itemId => itemId !== id)
				return
			}

			itemsRef.current.set(id, { id, element, locked, ...callbacks })
			if (!orderRef.current.includes(id)) orderRef.current.push(id)
		},
		[]
	)

	const clearSiblingTransforms = useCallback(() => {
		for (const { element } of itemsRef.current.values()) {
			element.style.removeProperty('--drag-area-x')
			element.style.removeProperty('--drag-area-y')
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
		sortableSlotsRef.current = orderRef.current
			.filter(id => !itemsRef.current.get(id)?.locked)
			.map(id => layout.get(id))
			.filter((slot): slot is Slot => Boolean(slot))
			.sort((a, b) => a.top - b.top || a.left - b.left)
	}, [])

	const getTargetSlot = useCallback((event: PointerEvent) => {
		const active = activeIdRef.current
		const slots = sortableSlotsRef.current
		const activeSlot = layoutRef.current.get(active ?? '')
		if (!active || !activeSlot || slots.length === 0) return -1

		const itemLeft = event.clientX - pointerOffsetRef.current.x
		const itemTop = event.clientY - pointerOffsetRef.current.y
		const centerX = itemLeft + activeSlot.width / 2
		const centerY = itemTop + activeSlot.height / 2

		// The grid is laid out row-major. Pick the row first, then the closest
		// column. This is more stable around the corners than a pure Euclidean
		// nearest-neighbour test.
		let best = 0
		let bestScore = Number.POSITIVE_INFINITY
		for (let i = 0; i < slots.length; i += 1) {
			const slot = slots[i]
			const dx = Math.abs(centerX - slot.centerX)
			const dy = Math.abs(centerY - slot.centerY)
			const score = dy * 1.75 + dx
			if (score < bestScore) {
				bestScore = score
				best = i
			}
		}
		return best
	}, [])

	const applyDragPosition = useCallback((event: PointerEvent) => {
		const activeId = activeIdRef.current
		const active = activeId ? itemsRef.current.get(activeId) : null
		const area = areaRef.current
		const origin = layoutRef.current.get(activeId ?? '')
		if (!active || !area || !origin) return

		const areaRect = area.getBoundingClientRect()
		const desiredLeft = event.clientX - pointerOffsetRef.current.x
		const desiredTop = event.clientY - pointerOffsetRef.current.y
		const minLeft = areaRect.left
		const maxLeft = areaRect.right - origin.width
		const minTop = areaRect.top
		const maxTop = areaRect.bottom - origin.height

		const left = clamp(desiredLeft, minLeft, Math.max(minLeft, maxLeft))
		const top = clamp(desiredTop, minTop, Math.max(minTop, maxTop))

		active.element.style.setProperty('--drag-area-x', `${left - origin.left}px`)
		active.element.style.setProperty('--drag-area-y', `${top - origin.top}px`)
	}, [])

	const applySiblingTransforms = useCallback((targetSlot: number) => {
		const activeId = activeIdRef.current
		if (!activeId) return

		const sortableIds = orderRef.current.filter(
			id => !itemsRef.current.get(id)?.locked
		)
		const from = sortableIds.indexOf(activeId)
		if (from < 0) return

		const destination = clamp(targetSlot, 0, sortableIds.length - 1)
		if (destination === activeSlotRef.current) return

		const virtualOrder = [...sortableIds]
		virtualOrder.splice(from, 1)
		virtualOrder.splice(destination, 0, activeId)

		const slots = sortableSlotsRef.current
		const layout = layoutRef.current

		for (let index = 0; index < virtualOrder.length; index += 1) {
			const id = virtualOrder[index]
			if (id === activeId) continue
			const item = itemsRef.current.get(id)
			const fromRect = layout.get(id)
			const toSlot = slots[index]
			if (!item || !fromRect || !toSlot) continue

			item.element.style.setProperty(
				'--drag-area-x',
				`${toSlot.left - fromRect.left}px`
			)
			item.element.style.setProperty(
				'--drag-area-y',
				`${toSlot.top - fromRect.top}px`
			)
		}

		activeSlotRef.current = destination
	}, [])

	const detachListeners = useCallback(() => {
		if (!listenersRef.current) return
		window.removeEventListener('pointermove', handlePointerMoveRef.current)
		window.removeEventListener('pointerup', handlePointerUpRef.current)
		window.removeEventListener('pointercancel', handlePointerCancelRef.current)
		listenersRef.current = false
	}, [])

	const end = useCallback(
		(cancelled = false) => {
			const activeId = activeIdRef.current
			if (!activeId) return

			detachListeners()
			if (activePointerIdRef.current !== null) {
				itemsRef.current.get(activeId)?.element.releasePointerCapture?.(activePointerIdRef.current)
			}

			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current)
				rafRef.current = null
			}

			const sortable = orderRef.current.filter(
				id => !itemsRef.current.get(id)?.locked
			)
			const from = sortable.indexOf(activeId)
			const to = activeSlotRef.current
			let nextOrder = [...startOrderRef.current]

			if (!cancelled && from >= 0 && to >= 0 && from !== to) {
				const nextSortable = [...sortable]
				const [moved] = nextSortable.splice(from, 1)
				nextSortable.splice(to, 0, moved)

				let index = 0
				nextOrder = nextOrder.map(id => {
					if (itemsRef.current.get(id)?.locked) return id
					return nextSortable[index++]
				})
			}

			orderRef.current = nextOrder
			clearSiblingTransforms()
			activeIdRef.current = null
			activePointerIdRef.current = null
			setActiveId(null)

			const changed = nextOrder.join('\0') !== startOrderRef.current.join('\0')
			if (!cancelled && changed) onOrderChange?.(nextOrder, activeId)
			itemsRef.current.get(activeId)?.onDragEnd?.(activeId, {
				cancelled,
				order: nextOrder
			})
		},
		[clearSiblingTransforms, detachListeners, onOrderChange]
	)

	const handlePointerMoveRef = useRef<(event: PointerEvent) => void>(() => undefined)
	const handlePointerUpRef = useRef<(event: PointerEvent) => void>(() => undefined)
	const handlePointerCancelRef = useRef<(event: PointerEvent) => void>(() => undefined)

	const handlePointerMove = useCallback((event: PointerEvent) => {
		if (!activeIdRef.current || event.pointerId !== activePointerIdRef.current) return
		pendingPointerRef.current = event
		if (rafRef.current !== null) return

		rafRef.current = requestAnimationFrame(() => {
			rafRef.current = null
			const pointer = pendingPointerRef.current
			if (!pointer || !activeIdRef.current) return

			applyDragPosition(pointer)
			const target = getTargetSlot(pointer)
			if (target >= 0) applySiblingTransforms(target)
		})
	}, [applyDragPosition, applySiblingTransforms, getTargetSlot])

	const handlePointerUp = useCallback(
		(event: PointerEvent) => {
			if (event.pointerId !== activePointerIdRef.current) return
			end(false)
		},
		[end]
	)

	const handlePointerCancel = useCallback(
		(event: PointerEvent) => {
			if (event.pointerId !== activePointerIdRef.current) return
			end(true)
		},
		[end]
	)

	handlePointerMoveRef.current = handlePointerMove
	handlePointerUpRef.current = handlePointerUp
	handlePointerCancelRef.current = handlePointerCancel

	const start = useCallback(
		(id: string, event: PointerEvent) => {
			const item = itemsRef.current.get(id)
			const area = areaRef.current
			if (!item || item.locked || !area || activeIdRef.current) return

			activeIdRef.current = id
			activePointerIdRef.current = event.pointerId
			item.onDragStart?.(id)
			startOrderRef.current = [...orderRef.current]
			setActiveId(id)

			const rect = item.element.getBoundingClientRect()
			pointerOffsetRef.current = {
				x: event.clientX - rect.left,
				y: event.clientY - rect.top
			}

			captureLayout()
			const sortable = orderRef.current.filter(
				itemId => !itemsRef.current.get(itemId)?.locked
			)
			activeSlotRef.current = sortable.indexOf(id)

			item.element.setPointerCapture?.(event.pointerId)
			window.addEventListener('pointermove', handlePointerMove)
			window.addEventListener('pointerup', handlePointerUp)
			window.addEventListener('pointercancel', handlePointerCancel)
			listenersRef.current = true
		},
		[captureLayout, handlePointerCancel, handlePointerMove, handlePointerUp]
	)

	useEffect(() => {
		if (columns !== 'auto') return
		const area = areaRef.current
		if (!area) return

		const updateColumns = () => {
			const first = Array.from(itemsRef.current.values())[0]?.element
			if (!first) return
			const width = first.getBoundingClientRect().width
			if (!width) return
			const columnGapValue = columnGap ?? gap
			const count = Math.max(1, Math.floor((area.clientWidth + columnGapValue) / (width + columnGapValue)))
			area.style.setProperty('--drag-area-columns', String(count))
		}

		updateColumns()
		const observer = new ResizeObserver(updateColumns)
		observer.observe(area)
		for (const { element } of itemsRef.current.values()) observer.observe(element)
		return () => observer.disconnect()
	}, [columnGap, columns, gap])

	useEffect(() => () => {
		if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
		detachListeners()
		clearSiblingTransforms()
	}, [clearSiblingTransforms, detachListeners])

	const contextValue = useMemo<DragAreaContextValue>(
		() => ({
			register,
			start,
			activeId,
			isDragging: activeId !== null
		}),
		[activeId, register, start]
	)

	return (
		<DragAreaContext.Provider value={contextValue}>
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
				{children}
			</div>
		</DragAreaContext.Provider>
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
	const { register, start, activeId } = useDragAreaContext()

	useEffect(() => {
		register(id, wrapperRef.current, disabled || locked, {
			onDragStart,
			onDragEnd
		})
		return () => register(id, null, disabled || locked)
	}, [disabled, id, locked, onDragEnd, onDragStart, register])

	useEffect(() => {
		const wrapper = wrapperRef.current
		if (!wrapper) return

		const child = wrapper.firstElementChild
		if (!(child instanceof HTMLElement)) return

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
			className={[
				styles.item,
				activeId === id ? styles.active : '',
				activeId && activeId !== id ? styles.sibling : '',
				className ?? ''
			].filter(Boolean).join(' ')}
			style={style}
			onPointerDown={handlePointerDown}
			data-drag-id={id}
			data-drag-locked={disabled || locked ? 'true' : undefined}
		>
			{children}
		</div>
	)
}

export { useDragAreaContext }

