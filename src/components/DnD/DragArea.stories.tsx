import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { DragArea, DragElement } from './DragArea'

const meta = {
	title: 'Components/Drag & Drop/DragArea',
	parameters: {
		layout: 'fullscreen'
	},
	argTypes: {
		columns: {
			control: { type: 'number', min: 1, max: 10, step: 1 }
		},
		gap: {
			control: { type: 'number', min: 0, max: 40, step: 1 }
		}
	}
} satisfies Meta<typeof DragArea>

export default meta

type Story = StoryObj<typeof meta>

const pageStyle = {
	minHeight: '100vh',
	padding: 24,
	boxSizing: 'border-box' as const,
	background: 'var(--uikit-bg-main)',
	color: 'var(--uikit-text-main)',
	fontFamily: 'inherit'
}

const panelStyle = {
	width: 'min(100%, 1120px)',
	margin: '0 auto',
	padding: 20,
	boxSizing: 'border-box' as const,
	border: '1px solid var(--uikit-border)',
	borderRadius: 'var(--uikit-matched-radius)',
	background: 'var(--uikit-bg-block-inner)',
	boxShadow: '0 10px 30px var(--uikit-block-shadow)'
}

const cardStyle = {
	width: 150,
	height: 230,
	boxSizing: 'border-box' as const,
	border: '1px solid var(--uikit-border)',
	borderRadius: 'var(--uikit-matched-radius)',
	background: 'var(--uikit-bg-block)',
	overflow: 'hidden',
	position: 'relative' as const
}

const PageCard = ({ index }: { index: number }) => (
	<div style={cardStyle}>
		<div
			style={{
				height: 28,
				padding: '0 10px',
				boxSizing: 'border-box',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				background: 'var(--uikit-bg-block-inner)',
				borderBottom: '1px solid var(--uikit-border)',
				color: 'var(--uikit-text-muted)',
				fontSize: 12
			}}
		>
			<span>▢</span>
			<span>{index + 1}</span>
		</div>
		<div
			style={{
				height: 'calc(100% - 28px)',
				display: 'grid',
				placeItems: 'center',
				padding: 12,
				boxSizing: 'border-box',
				background: 'linear-gradient(135deg, var(--uikit-bg-main), var(--uikit-bg-block))',
				color: 'var(--uikit-text-muted)',
				fontSize: 13,
				textAlign: 'center'
			}}
		>
			Страница {index + 1}
		</div>
	</div>
)

const AddPageCard = () => (
	<div
		style={{
			...cardStyle,
			display: 'grid',
			placeItems: 'center',
			padding: 20,
			boxSizing: 'border-box',
			textAlign: 'center',
			color: 'var(--uikit-text-muted)',
			background: 'var(--uikit-bg-block)'
		}}
	>
		<div>
			<div style={{ fontSize: 28, marginBottom: 10, color: 'var(--uikit-accent)' }}>+</div>
			<div style={{ fontSize: 13, lineHeight: 1.4 }}>
				Добавить страницы
				<br />
				поддерживаются .zip, .rar, .png, .jpg, .gif
			</div>
		</div>
	</div>
)

const GridDemo = () => {
	const [order, setOrder] = useState(() => Array.from({ length: 10 }, (_, i) => `page-${i + 1}`))

	return (
		<div style={pageStyle}>
			<div style={panelStyle}>
				<div style={{ marginBottom: 18 }}>
					<h2 style={{ margin: 0, fontSize: 20 }}>DragArea — grid sorting</h2>
					<p style={{ margin: '8px 0 0', color: 'var(--uikit-text-muted)', fontSize: 14 }}>
						Первый элемент зафиксирован. Остальные карточки перестраиваются по сетке
						во время перетаскивания, а итоговый порядок возвращается через onOrderChange.
					</p>
				</div>

				<DragArea
					columns={6}
					gap={16}
					onOrderChange={nextOrder => setOrder(nextOrder.filter(id => id.startsWith('page-')))}
				>
					<DragElement id='add-page' locked>
						<AddPageCard />
					</DragElement>
					{order.map(id => {
						const index = Number(id.replace('page-', '')) - 1
						return (
							<DragElement
								key={id}
								id={id}
								onDragStart={draggedId => console.log('drag start:', draggedId)}
								onDragEnd={(draggedId, event) => console.log('drag end:', draggedId, event)}
							>
								<PageCard index={index} />
							</DragElement>
						)
					})}
				</DragArea>

				<div
					style={{
						marginTop: 18,
						padding: '10px 12px',
						borderRadius: 8,
						background: 'var(--uikit-bg-block)',
						color: 'var(--uikit-text-muted)',
						fontSize: 12,
						wordBreak: 'break-word'
					}}
				>
					Порядок: {order.join(' → ')}
				</div>
			</div>
		</div>
	)
}

export const Grid: Story = {
	render: () => <GridDemo />
}

const CallbacksDemo = () => {
	const [status, setStatus] = useState('Зажмите карточку')

	return (
		<div style={pageStyle}>
			<div style={{ ...panelStyle, maxWidth: 700 }}>
				<h2 style={{ margin: 0, fontSize: 20 }}>DragElement callbacks</h2>
				<p style={{ color: 'var(--uikit-text-muted)', fontSize: 14 }}>
					DragElement передаёт id в onDragStart и информацию об освобождении в onDragEnd.
				</p>
				<DragArea columns={3} gap={16}>
					{['A', 'B', 'C'].map(label => (
						<DragElement
							key={label}
							id={`callback-${label}`}
							onDragStart={id => setStatus(`Взят: ${id}`)}
							onDragEnd={(id, event) =>
								setStatus(`${event.cancelled ? 'Отменён' : 'Освобождён'}: ${id}`)
							}
						>
							<div
								style={{
									width: 120,
									height: 80,
									borderRadius: 'var(--uikit-matched-radius)',
									border: '1px solid var(--uikit-border)',
									background: 'var(--uikit-bg-block)',
									display: 'grid',
									placeItems: 'center',
									color: 'var(--uikit-text-main)'
								}}
							>
								{label}
							</div>
						</DragElement>
					))}
				</DragArea>
				<div style={{ marginTop: 16, color: 'var(--uikit-text-muted)', fontSize: 13 }}>{status}</div>
			</div>
		</div>
	)
}

export const Callbacks: Story = {
	render: () => <CallbacksDemo />
}
