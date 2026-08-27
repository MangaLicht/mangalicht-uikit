import type { IUIKitProps } from '@shared/types/IUIKitProps'
import React, { useContext } from 'react'
import { DropDownContext } from './context'
import styles from './DropDown.module.scss'

export interface DropDownItemProps extends IUIKitProps {
	/** Текст пункта меню */
	label: string
	/** Колбэк клика */
	onClick?: (event: React.MouseEvent<HTMLLIElement>) => void
	/** Заблокировать пункт */
	disabled?: boolean
	/** Иконка перед текстом */
	icon?: React.ReactNode
}

/**
 * DropDownItem — листовой пункт меню DropDown. Больше не поддерживает
 * children/вложенность — для подменю используйте DropDown, вложенный
 * в другой DropDown (см. index.tsx).
 */
export const DropDownItem = ({
	label,
	onClick,
	disabled = false,
	icon,
	classNames
}: DropDownItemProps) => {
	const dropDownCtx = useContext(DropDownContext)

	const handleClick = (event: React.MouseEvent<HTMLLIElement>) => {
		if (disabled) return
		onClick?.(event)
		if (dropDownCtx?.closeOnItemClick ?? true) {
			dropDownCtx?.closeMenu()
		}
	}

	return (
		<li
			role='menuitem'
			className={[styles.item, 'uikit_rounded', classNames]
				.filter(Boolean)
				.join(' ')}
			data-disabled={disabled}
			aria-disabled={disabled}
			onClick={handleClick}
		>
			<span className={styles.itemRow}>
				{icon ? (
					<span className={styles.itemIcon} aria-hidden='true'>
						{icon}
					</span>
				) : null}
				<span className={styles.itemLabel}>{label}</span>
			</span>
		</li>
	)
}

DropDownItem.displayName = 'DropDownItem'
