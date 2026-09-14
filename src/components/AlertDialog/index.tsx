import {
	forwardRef,
	useEffect,
	useId,
	useRef,
	type HTMLAttributes,
	type ReactNode
} from 'react'

import { DialogWindow } from '../DialogWindow'

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
			open = false,
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

		const setRef = (node: HTMLDivElement | null) => {
			dialogRef.current = node

			if (typeof forwardedRef === 'function') {
				forwardedRef(node)
			} else if (forwardedRef) {
				forwardedRef.current = node
			}
		}

		return (
			<DialogWindow
				ref={setRef}
				isOpen={open}
				onClose={() => onClose?.()}
				closeOnOverlayClick={closeOnOverlayClick}
				closeOnEscape={closeOnEscape}
				overlayClassName={styles.overlay}
				className={[styles.dialog, className].filter(Boolean).join(' ')}
				style={
					{
						'--alert-dialog-blur': `${blur}px`
					} as React.CSSProperties
				}
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

				{children && <div className={styles.content}>{children}</div>}
			</DialogWindow>
		)
	}
)

AlertDialog.displayName = 'AlertDialog'
