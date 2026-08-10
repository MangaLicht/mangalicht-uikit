import React from 'react'
import { Carousel } from './index'
import { Button } from '../Button'

const meta = {
	title: 'Components/Carousel',
	component: Carousel,
	argTypes: {
		showDots: { control: 'boolean' },
		showArrows: { control: 'boolean' },
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
						Тестовый слайд 1
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
						Тестовый слайд 2
					</h2>
					<Button labelText='Получить' variant='highlight' />
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
						Тестовый слайд 3
					</h2>
					<Button labelText='Установить' variant='highlight' />
				</div>
			</div>
		)
	}
]

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
