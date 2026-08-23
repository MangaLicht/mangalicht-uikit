import type { ReactNode } from 'react'
import { Flame } from 'lucide-react'

import styles from './StrikBadge.module.scss'

export interface StrickBadgeProps {
	/** Текущее значение серии. */
	value: number | string

	/** Запускает периодическую анимацию Flame. По умолчанию true. */
	animated?: boolean

	/** Дополнительный className. */
	classNames?: string

	/** Дополнительная подпись для доступности. */
	ariaLabel?: string

	/** Дополнительное содержимое внутри badge. */
	children?: ReactNode
}

export const StrickBadge = ({
	value,
	animated = true,
	classNames,
	ariaLabel,
	children
}: StrickBadgeProps) => {
	return (
		<span
			className={[styles.badge, classNames].filter(Boolean).join(' ')}
			aria-label={ariaLabel ?? `Серия: ${value}`}
		>
			<span
				className={[styles.icon, animated ? styles.iconAnimated : '']
					.filter(Boolean)
					.join(' ')}
				aria-hidden='true'
			>
				<Flame size={42} strokeWidth={2.6} />
			</span>

			<span className={styles.value}>{value}</span>

			{children ? (
				<span className={styles.children}>{children}</span>
			) : null}
		</span>
	)
}

StrickBadge.displayName = 'StrickBadge'
