import {
	useCallback,
	useRef,
	useState,
	type CSSProperties,
	type RefObject
} from 'react'
import {
	autoUpdate,
	computePosition,
	flip,
	offset,
	shift,
	size,
	type Placement
} from '@floating-ui/dom'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

export interface UseAnchoredPositionOptions<T extends HTMLElement = HTMLElement> {
	open: boolean
	offset?: number
	matchWidth?: boolean
	placement?: Placement
	panelRef?: RefObject<T | null>
}

export interface UseAnchoredPositionResult<T extends HTMLElement> {
	panelRef: RefObject<T | null>
	style: CSSProperties
	recalculate: () => void
}

export function useAnchoredPosition<T extends HTMLElement>(
	triggerRef: RefObject<HTMLElement | null>,
	{
		open,
		offset: gap = 4,
		matchWidth = true,
		placement = 'bottom-start',
		panelRef: externalPanelRef
	}: UseAnchoredPositionOptions<T>
): UseAnchoredPositionResult<T> {
	const internalPanelRef = useRef<T | null>(null)
	const panelRef = externalPanelRef ?? internalPanelRef
	const [style, setStyle] = useState<CSSProperties>({
		visibility: 'hidden'
	})

	const recalculate = useCallback(() => {
		const trigger = triggerRef.current
		const panel = panelRef.current
		if (!trigger || !panel) return

		void computePosition(trigger, panel, {
			placement,
			strategy: 'fixed',
			middleware: [
				offset(gap),
				flip(),
				shift({ padding: 4 }),
				...(matchWidth
					? [
							size({
								apply({ rects }) {
									panel.style.width = `${rects.reference.width}px`
								}
							})
						]
					: [])
			]
		}).then(({ x, y }) => {
			setStyle({
				position: 'fixed',
				left: Math.round(x),
				top: Math.round(y),
				visibility: 'visible'
			})
		})
	}, [gap, matchWidth, panelRef, placement, triggerRef])

	useIsomorphicLayoutEffect(() => {
		if (!open) {
			setStyle(current => ({ ...current, visibility: 'hidden' }))
			return undefined
		}

		let cleanupAutoUpdate: (() => void) | undefined
		let frame = 0

		frame = requestAnimationFrame(() => {
			const trigger = triggerRef.current
			const panel = panelRef.current
			if (!trigger || !panel) return

			recalculate()
			cleanupAutoUpdate = autoUpdate(trigger, panel, recalculate, {
				ancestorScroll: true,
				ancestorResize: true,
				elementResize: true,
				layoutShift: true,
				animationFrame: true
			})
		})

		return () => {
			cancelAnimationFrame(frame)
			cleanupAutoUpdate?.()
		}
	}, [open, panelRef, recalculate, triggerRef])


	return { panelRef, style, recalculate }
}
