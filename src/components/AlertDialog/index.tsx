import {
	forwardRef,
	useEffect,
	useId,
	useRef,
	type HTMLAttributes,
	type ReactNode
} from 'react'
import { createPortal } from 'react-dom'

import styles from './AlertDialog.module.scss'

export interface AlertDialogProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'title'
> {
	open: boolean
	title?: ReactNode
	description?: ReactNode
	children?: ReactNode
	onClose?: () => void
	closeOnOverlayClick?: boolean
	closeOnEscape?: boolean
	blur?: number
}

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
	(
		{
			open,
			title,
			description,
			children,
			onClose,
			closeOnOverlayClick = true,
			closeOnEscape = true,
			blur = 6,
			className,
			...props
		},
		forwardedRef
	) => {
		const titleId = useId()
		const descriptionId = useId()
		const dialogRef = useRef<HTMLDivElement | null>(null)

		useEffect(() => {
			if (!open || !closeOnEscape) {
				return
			}

			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key !== 'Escape') {
					return
				}

				event.preventDefault()
				onClose?.()
			}

			document.addEventListener('keydown', handleKeyDown)

			return () => {
				document.removeEventListener('keydown', handleKeyDown)
			}
		}, [open, closeOnEscape, onClose])

		useEffect(() => {
			if (!open) {
				return
			}

			const previousOverflow = document.body.style.overflow

			document.body.style.overflow = 'hidden'

			return () => {
				document.body.style.overflow = previousOverflow
			}
		}, [open])

		useEffect(() => {
			if (!open) {
				return
			}

			const frame = requestAnimationFrame(() => {
				dialogRef.current?.focus()
			})

			return () => {
				cancelAnimationFrame(frame)
			}
		}, [open])

		if (!open) {
			return null
		}

		const portalRoot =
			document.getElementById('portal-root') ?? document.body

		const handleOverlayClick = (
			event: React.MouseEvent<HTMLDivElement>
		) => {
			if (!closeOnOverlayClick || event.target !== event.currentTarget) {
				return
			}

			onClose?.()
		}

		const setRef = (node: HTMLDivElement | null) => {
			dialogRef.current = node

			if (typeof forwardedRef === 'function') {
				forwardedRef(node)
			} else if (forwardedRef) {
				forwardedRef.current = node
			}
		}

		return createPortal(
			<div
				className={styles.overlay}
				style={
					{
						'--alert-dialog-blur': `${blur}px`
					} as React.CSSProperties
				}
				onMouseDown={handleOverlayClick}
			>
				<div
					ref={setRef}
					className={[styles.dialog, className]
						.filter(Boolean)
						.join(' ')}
					role='alertdialog'
					aria-modal='true'
					aria-labelledby={title ? titleId : undefined}
					aria-describedby={description ? descriptionId : undefined}
					tabIndex={-1}
					{...props}
				>
					{title && (
						<div id={titleId} className={styles.title}>
							{title}
						</div>
					)}

					{description && (
						<div id={descriptionId} className={styles.description}>
							{description}
						</div>
					)}

					{children && (
						<div className={styles.content}>{children}</div>
					)}
				</div>
			</div>,
			portalRoot
		)
	}
)

AlertDialog.displayName = 'AlertDialog'
