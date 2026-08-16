import React from 'react'
import { ProfileLevelBadge } from '../ProfileLevel/ProfileLevelBadge'
import { Block } from '../../Block'

const meta = {
	title: 'Components/Badge/ProfileLevel',
	component: ProfileLevelBadge,
	argTypes: {
		variant: {
			control: 'select',
			options: ['bronze', 'silver', 'gold', 'platinum', 'ruby', 'diamond']
		},
		shine: { control: 'boolean' }
	}
}

export default meta

export const Default = {
	args: {
		variant: 'gold',
		level: 50
	}
}

/** Все шесть тиров подряд — как на макете */
const TIERS: {
	variant: React.ComponentProps<typeof ProfileLevelBadge>['variant']
	level: number
	description: string
}[] = [
	{
		variant: 'bronze',
		level: 1,
		description: 'Медный — начальный значок, даётся с 1 по 50 уровень.'
	},
	{
		variant: 'silver',
		level: 10,
		description: 'Серебряный — базовый значок, даётся с 10 по 50 уровень.'
	},
	{
		variant: 'gold',
		level: 50,
		description: 'Золотой — продвинутый значок, даётся с 50 по 150 уровень.'
	},
	{
		variant: 'platinum',
		level: 150,
		description: 'Платиновый — значок знатока, даётся с 150 по 300 уровень.'
	},
	{
		variant: 'ruby',
		level: 300,
		description:
			'Рубиновый — профессиональный значок, даётся с 300 по 500 уровень.'
	},
	{
		variant: 'diamond',
		level: 500,
		description: 'Алмазный — значок ветерана, даётся с 500 по 1500 уровень.'
	}
]

export const Gallery = {
	render: () => (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
				maxWidth: 520
			}}
		>
			{TIERS.map(tier => (
				<div
					key={tier.variant}
					style={{ display: 'flex', alignItems: 'center', gap: 20 }}
				>
					<div style={{ flexShrink: 0 }}>
						<Block variant='default'>
							<ProfileLevelBadge
								variant={tier.variant}
								level={tier.level}
							/>
						</Block>
					</div>
					<span style={{ fontSize: 14, lineHeight: 1.4 }}>
						{tier.description}
					</span>
				</div>
			))}
		</div>
	)
}

/** shine=false — статичный значок без анимации */
export const WithoutShine = {
	args: {
		variant: 'diamond',
		level: 500,
		shine: false
	}
}

/** label переопределяет содержимое — необязательно текст "Уровень N" */
export const CustomLabel = {
	args: {
		variant: 'ruby',
		label: '🏆 Легенда'
	}
}
