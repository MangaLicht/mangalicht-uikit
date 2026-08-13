import type { Meta, StoryObj } from '@storybook/react'
import { ExpandableCard } from './index'
import { Button } from '../Button'

const meta = {
	title: 'Components/ExpandableCard',
	component: ExpandableCard,
	parameters: {
		layout: 'centered'
	}
} satisfies Meta<typeof ExpandableCard>

export default meta

type Story = StoryObj<typeof meta>

const GearIcon = () => (
	<svg viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<rect width='64' height='64' rx='8' fill='#07183D' />
		<path d='M15 32 47 14 37 32l10 18-32-18Z' fill='#39A9FF' />
	</svg>
)

export const Flexible: Story = {
	render: () => (
		<ExpandableCard showDelay={700}>
			<ExpandableCard.Icon>
				<GearIcon />
			</ExpandableCard.Icon>

			<ExpandableCard.Title>TITLE NAME</ExpandableCard.Title>

			<ExpandableCard.Subtitle>
				TITLE DESCRIPTION HERE
			</ExpandableCard.Subtitle>

			<ExpandableCard.Action>
				<Button variant='highlight' labelText='Читать' />
			</ExpandableCard.Action>

			<ExpandableCard.Content>
				<div
					style={{
						display: 'flex',
						height: '100%',
						flexDirection: 'column',
						gap: 10
					}}
				>
					<p style={{ margin: 0, fontSize: 13, lineHeight: 1.35 }}>
						Здесь будет короткое описание тайтла и всё такое дааа...
					</p>

					<div
						style={{
							flex: 1,
							minHeight: 0,
							borderRadius: 4,
							background: '#07183D',
							display: 'grid',
							placeItems: 'center'
						}}
					></div>
				</div>
			</ExpandableCard.Content>

			<ExpandableCard.Footer>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 10
					}}
				>
					<strong style={{ fontSize: 24 }}>0+</strong>

					<div>
						<div style={{ fontWeight: 700 }}>
							Для всех возрастов
						</div>
						<div style={{ fontSize: 11, opacity: 0.65 }}>
							Покупки из приложения
						</div>
					</div>
				</div>
			</ExpandableCard.Footer>
		</ExpandableCard>
	)
}
