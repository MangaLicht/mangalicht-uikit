import { type CSSProperties, type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from 'lucide-react'
import { Button } from '../Button'

import styles from './Sheet.module.scss'

export type SheetSide = 'left' | 'right'

export interface SheetProps {
	/**
	 * Состояние панели.
	 */
	open: boolean

	/**
	 * Сторона, с которой появляется Sheet.
	 */
	side?: SheetSide

	titleText: string

	/**
	 * Содержимое панели.
	 */
	children?: ReactNode

	/**
	 * Ширина панели.
	 */
	width?: string | number

	/**
	 * Закрывать Sheet при клике по overlay.
	 */
	closeOnOverlayClick?: boolean

	/**
	 * Закрывать Sheet клавишей Escape.
	 */
	closeOnEscape?: boolean

	/**
	 * Размытие заднего фона.
	 */
	blur?: number

	/**
	 * Дополнительный класс панели.
	 */
	className?: string

	/**
	 * Callback закрытия.
	 */
	onClose: () => void
}

export const Sheet = ({
	open,
	side = 'right',
	titleText,
	children,
	width = 360,
	closeOnOverlayClick = true,
	closeOnEscape = true,
	blur = 6,
	className,
	onClose
}: SheetProps) => {
	useEffect(() => {
		if (!open || !closeOnEscape) {
			return
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return
			}

			event.preventDefault()
			onClose()
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

	if (!open) {
		return null
	}

	const sheetClassName = [styles.sheet, styles[side], className]
		.filter(Boolean)
		.join(' ')

	const sheetStyle = {
		'--sheet-width': typeof width === 'number' ? `${width}px` : width,
		'--sheet-blur': `${blur}px`
	} as CSSProperties

	const handleOverlayMouseDown = (
		event: React.MouseEvent<HTMLDivElement>
	) => {
		if (!closeOnOverlayClick) {
			return
		}

		if (event.target === event.currentTarget) {
			onClose()
		}
	}

	return createPortal(
		<div
			className={styles.overlay}
			style={sheetStyle}
			onMouseDown={handleOverlayMouseDown}
		>
			<aside
				className={sheetClassName}
				role='dialog'
				aria-modal='true'
				onMouseDown={event => event.stopPropagation()}
			>
				<div className={styles.header}>
					<h6 className={styles.title}>{titleText}</h6>
					<Button
						variant='ghost'
						iconStart={<XIcon />}
						classNames={styles.closeButton}
						onClick={onClose}
					/>
				</div>
				<div className={styles.content}>{children}</div>
			</aside>
		</div>,
		document.body
	)
}

Sheet.displayName = 'Sheet'
