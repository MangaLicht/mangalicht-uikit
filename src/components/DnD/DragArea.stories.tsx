import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { DragArea, DragElement } from './DragArea'

const meta = {
	title: 'Components/Drag & Drop/DragArea',
	parameters: { layout: 'fullscreen' },
	argTypes: {
		columns: { control: { type: 'number', min: 1, max: 10, step: 1 } },
		gap: { control: { type: 'number', min: 0, max: 40, step: 1 } }
	}
} satisfies Meta<typeof DragArea>

export default meta
type Story = StoryObj<typeof meta>

const pageStyle = {
	minHeight: '100vh', padding: 24, boxSizing: 'border-box' as const,
	background: 'var(--uikit-bg-main)', color: 'var(--uikit-text-main)', fontFamily: 'inherit'
}

const panelStyle = {
	width: 'min(100%, 1120px)', margin: '0 auto', padding: 20, boxSizing: 'border-box' as const,
	border: '1px solid var(--uikit-border)', borderRadius: 'var(--uikit-matched-radius)',
	background: 'var(--uikit-bg-block-inner)', boxShadow: '0 10px 30px var(--uikit-block-shadow)'
}

const cardStyle = {
	width: 150, height: 210, boxSizing: 'border-box' as const,
	border: '1px solid var(--uikit-border)', borderRadius: 'var(--uikit-matched-radius)',
	background: 'var(--uikit-bg-block)', overflow: 'hidden', position: 'relative' as const
}

const Card = ({ index }: { index: number }) => (
	<div style={cardStyle}>
		<div style={{ height: 30, padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--uikit-bg-block-inner)', borderBottom: '1px solid var(--uikit-border)', color: 'var(--uikit-text-muted)', fontSize: 12 }}>
			<span>PAGE</span><span>{index + 1}</span>
		</div>
		<div style={{ height: 'calc(100% - 30px)', display: 'grid', placeItems: 'center', color: 'var(--uikit-text-muted)', fontSize: 13 }}>
			Страница {index + 1}
		</div>
	</div>
)

const AddCard = () => (
	<div style={{ ...cardStyle, display: 'grid', placeItems: 'center', padding: 20, textAlign: 'center', color: 'var(--uikit-text-muted)' }}>
		<div><div style={{ fontSize: 30, marginBottom: 8, color: 'var(--uikit-accent)' }}>+</div>Добавить страницы</div>
	</div>
)

export const Grid: Story = {
	render: () => (
		<div style={pageStyle}>
			<div style={panelStyle}>
				<h2 style={{ margin: 0, fontSize: 20 }}>Grid sorting</h2>
				<p style={{ color: 'var(--uikit-text-muted)', fontSize: 14, lineHeight: 1.5 }}>
					DragArea полностью владеет порядком элементов. Снаружи не нужен ни useState,
					ни reorder-функция. Заблокированная первая карточка остаётся на месте.
				</p>

				<DragArea columns={6} gap={16}>
					<DragElement id='add' locked><AddCard /></DragElement>
					{Array.from({ length: 11 }, (_, index) => (
						<DragElement key={`page-${index + 1}`} id={`page-${index + 1}`}>
							<Card index={index} />
						</DragElement>
					))}
				</DragArea>
			</div>
		</div>
	)
}

export const Callbacks: Story = {
	render: () => {
		const [status, setStatus] = useState('Зажмите карточку')
		return (
			<div style={pageStyle}>
				<div style={{ ...panelStyle, maxWidth: 700 }}>
					<h2 style={{ margin: 0 }}>Drag callbacks</h2>
					<p style={{ color: 'var(--uikit-text-muted)', fontSize: 14 }}>
						Callbacks остаются на DragElement и только сообщают о событии — сортировку писать не нужно.
					</p>
					<DragArea columns={3} gap={16}>
						{['A', 'B', 'C'].map(label => (
							<DragElement
								key={label}
								id={`callback-${label}`}
								onDragStart={id => setStatus(`Взят: ${id}`)}
								onDragEnd={(id, event) => setStatus(`${event.cancelled ? 'Отменён' : 'Освобождён'}: ${id}`)}
							>
								<div style={{ width: 120, height: 80, display: 'grid', placeItems: 'center', border: '1px solid var(--uikit-border)', borderRadius: 'var(--uikit-matched-radius)', background: 'var(--uikit-bg-block)' }}>
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
}
