import { useEffect, useRef, type RefObject } from 'react'

export function useClickOutside(
	refs: Array<RefObject<HTMLElement | null>>,
	onOutside: () => void,
	enabled = true
) {
	const refsRef = useRef(refs)
	const onOutsideRef = useRef(onOutside)

	refsRef.current = refs
	onOutsideRef.current = onOutside

	useEffect(() => {
		if (!enabled) return undefined

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target
			if (!(target instanceof Node)) return

			const isInside = refsRef.current.some(ref =>
				ref.current?.contains(target)
			)

			if (!isInside) onOutsideRef.current()
		}

		document.addEventListener('pointerdown', handlePointerDown)
		return () =>
			document.removeEventListener('pointerdown', handlePointerDown)
	}, [enabled])
}
