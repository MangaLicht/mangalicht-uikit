import styles from './SimpleBadge.module.scss'

export type SimpleBadgeVariant =
	'primary' | 'destructive' | 'outline' | 'positive'

const BADGE_VARIANT: Record<SimpleBadgeVariant, string> = {
	primary: styles.primary,
	destructive: styles.destructive,
	outline: styles.outline,
	positive: styles.positive
}

export interface SimpleBadgeProps extends IUIKitProps {
	label: string
	variant?: SimpleBadgeVariant
}

export const SimpleBadge = ({
	label,
	variant = 'primary',
	classNames
}: SimpleBadgeProps) => {
	return (
		<span
			className={[styles.badge, BADGE_VARIANT[variant], classNames]
				.filter(Boolean)
				.join(' ')}
		>
			<span className={styles.content}>{label}</span>
		</span>
	)
}

SimpleBadge.displayName = 'SimpleBadge'
