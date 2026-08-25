import React from 'react'
import { Carousel } from './index'
import { Button } from '../Button'

const meta = {
	title: 'Components/Carousel',
	component: Carousel,
	argTypes: {
		showDots: { control: 'boolean' },
		showArrows: { control: 'boolean' },
		dotsPosition: { control: 'select', options: ['outside', 'inside'] },
		swipe: { control: 'boolean' },
		variant: { control: 'select', options: ['default', 'card'] },
		autoPlayInterval: { control: 'number' },
		slides: { control: false }
	}
}
export default meta

const slideStyle = (from: string, to: string): React.CSSProperties => ({
	width: '100%',
	height: '100%',
	display: 'flex',
	alignItems: 'flex-end',
	padding: 32,
	boxSizing: 'border-box',
	background: `linear-gradient(135deg, ${from}, ${to})`,
	color: '#fff'
})

const demoSlides = [
	{
		id: 'slide-1',
		content: (
			<div style={slideStyle('#0f2027', '#2c5364')}>
				<div>
					<h2
						style={{
							maxWidth: 320,
							fontSize: 28,
							margin: '0 0 12px'
						}}
					>
						Тест карусели
					</h2>
					<Button labelText='Подробнее' variant='bordered' />
				</div>
			</div>
		)
	},
	{
		id: 'slide-2',
		content: (
			<div style={slideStyle('#41295a', '#2F0743')}>
				<div>
					<h2 style={{ fontSize: 28, margin: '0 0 12px' }}>
						Поколение Нова
					</h2>
					<Button labelText='Читать' variant='highlight' />
				</div>
			</div>
		)
	},
	{
		id: 'slide-3',
		content: (
			<div style={slideStyle('#3a1c71', '#d76d77')}>
				<div>
					<h2 style={{ fontSize: 28, margin: '0 0 12px' }}>
						Миры Этерии
					</h2>
					<Button labelText='Читать' variant='highlight' />
				</div>
			</div>
		)
	}
]

const cardSlides = Array.from({ length: 8 }, (_, index) => ({
	id: `card-${index + 1}`,
	content: (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'grid',
				placeItems: 'center',
				fontSize: 36,
				fontWeight: 700,
				color: 'var(--uikit-text-main)'
			}}
		>
			{index + 1}
		</div>
	)
}))

export const Default = {
	render: () => (
		<div style={{ width: 900 }}>
			<Carousel slides={demoSlides} height={360} collapsedWidth={128} />
		</div>
	)
}

export const AutoPlay = {
	render: () => (
		<div style={{ width: 900 }}>
			<Carousel
				slides={demoSlides}
				height={360}
				autoPlayInterval={3000}
			/>
		</div>
	)
}

export const WithoutArrows = {
	render: () => (
		<div style={{ width: 900 }}>
			<Carousel slides={demoSlides} height={360} showArrows={false} />
		</div>
	)
}

export const NoPeek = {
	name: 'Full width (peek = 0)',
	render: () => (
		<div style={{ width: 900 }}>
			<Carousel slides={demoSlides} height={360} />
		</div>
	)
}

export const Card = {
	name: 'Card',
	render: () => (
		<div
			style={{
				width: 475
			}}
		>
			<Carousel
				slides={cardSlides}
				variant='card'
				height={346}
				cardWidth={314}
				cardHeight={346}
				gap={6}
				showDots
				showArrows
				swipe
			/>
		</div>
	)
}

export const CardDotsInside = {
	name: 'Card — dots inside + swipe',
	render: () => (
		<div
			style={{
				width: 475,
				height: 397,
				background: 'var(--uikit-bg-main)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<Carousel
				slides={cardSlides}
				variant='card'
				height={397}
				cardWidth={314}
				cardHeight={346}
				gap={6}
				showDots
				dotsPosition='inside'
				showArrows
				swipe
			/>
		</div>
	)
}

export const CardWithoutDots = {
	name: 'Card — without dots',
	render: () => (
		<div
			style={{
				width: 475,
				height: 397,
				background: 'var(--uikit-bg-main)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<Carousel
				slides={cardSlides}
				variant='card'
				height={397}
				cardWidth={314}
				cardHeight={346}
				gap={6}
				showDots={false}
				showArrows
				swipe
			/>
		</div>
	)
}
