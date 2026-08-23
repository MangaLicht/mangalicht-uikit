import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'
import {
	measureTextareaSelection,
	type SelectionAnchorRect
} from '@shared/utils/measureSelection'

export type { SelectionAnchorRect }

export function useSelectionAnchor(
	textareaRef: RefObject<HTMLTextAreaElement | null>,
	value: string,
	enabled = true
) {
	const [rect, setRect] = useState<SelectionAnchorRect | null>(null)
	const frameRef = useRef<number | null>(null)

	const recalculate = useCallback(() => {
		const textarea = textareaRef.current

		if (!enabled || !textarea || document.activeElement !== textarea) {
			setRect(null)
			return
		}

		setRect(measureTextareaSelection(textarea))
	}, [enabled, textareaRef])

	useIsomorphicLayoutEffect(() => {
		recalculate()
	}, [recalculate, value])

	useEffect(() => {
		if (!enabled) return undefined

		const scheduleRecalculate = () => {
			if (frameRef.current !== null) return

			frameRef.current = window.requestAnimationFrame(() => {
				frameRef.current = null
				recalculate()
			})
		}

		document.addEventListener('selectionchange', scheduleRecalculate)
		window.addEventListener('resize', scheduleRecalculate)
		window.addEventListener('scroll', scheduleRecalculate, true)

		return () => {
			if (frameRef.current !== null) {
				window.cancelAnimationFrame(frameRef.current)
				frameRef.current = null
			}

			document.removeEventListener('selectionchange', scheduleRecalculate)
			window.removeEventListener('resize', scheduleRecalculate)
			window.removeEventListener('scroll', scheduleRecalculate, true)
		}
	}, [enabled, recalculate])

	const clear = useCallback(() => setRect(null), [])

	return { rect, recalculate, clear }
}
