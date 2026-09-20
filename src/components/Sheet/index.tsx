import { type CSSProperties, type ReactNode } from 'react'

import { XIcon } from 'lucide-react'

import { Button } from '../Button'
import { DialogWindow } from '../DialogWindow'

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

	/**
	 * Заголовок панели.
	 */
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
	 * Закрывать при клике по overlay.
	 */
	closeOnOverlayClick?: boolean

	/**
	 * Закрывать клавишей Escape.
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
	const sheetStyle = {
		'--sheet-width': typeof width === 'number' ? `${width}px` : width,
		'--sheet-blur': `${blur}px`
	} as CSSProperties

	return (
		<DialogWindow
			isOpen={open}
			onClose={onClose}
			closeOnOverlayClick={closeOnOverlayClick}
			closeOnEscape={closeOnEscape}
			overlayClassName={styles.overlay}
			className={[styles.sheet, styles[side], className]
				.filter(Boolean)
				.join(' ')}
			style={sheetStyle}
			role='dialog'
			aria-modal='true'
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
		</DialogWindow>
	)
}

Sheet.displayName = 'Sheet'
