import React from 'react'
import styles from './PLBadge.module.scss'

export type PLBadgeVariant =
	'bronze' | 'silver' | 'gold' | 'platinum' | 'ruby' | 'diamond'

export interface PLBadgeProps {
	/** Тир значка — определяет цветовую схему (медный/серебряный/золотой/платиновый/рубиновый/алмазный) */
	variant: PLBadgeVariant
	/** Значение уровня — если label не задан, показывается автотекст "Уровень {level}" */
	level?: number | string
	/** Полностью переопределяет содержимое значка вместо автогенерируемого "Уровень N" */
	label?: React.ReactNode
	/** Анимация переливающегося блика. По умолчанию true */
	shine?: boolean
	classNames?: string
}

export const ProfileLevelBadge = ({
	variant,
	level,
	label,
	shine = true,
	classNames
}: PLBadgeProps) => {
	const content = label ?? (level !== undefined ? `Уровень ${level}` : null)

	return (
		<span
			className={[styles.badge, classNames].filter(Boolean).join(' ')}
			data-variant={variant}
			data-shine={shine}
		>
			{shine ? (
				<span className={styles.shine} aria-hidden='true' />
			) : null}
			<span className={styles.content}>{content}</span>
		</span>
	)
}

ProfileLevelBadge.displayName = 'ProfileLevelBadge'
