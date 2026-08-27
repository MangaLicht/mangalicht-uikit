import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Button } from '../Button'
import { Sheet } from './'

const meta: Meta<typeof Sheet> = {
	title: 'Components/Sheet',
	component: Sheet,

	parameters: {
		layout: 'fullscreen'
	},

	argTypes: {
		open: {
			control: false
		},

		titleText: {
			control: {
				type: 'text'
			}
		},

		side: {
			control: 'select',
			options: ['left', 'right']
		},

		width: {
			control: {
				type: 'text'
			}
		},

		blur: {
			control: {
				type: 'number'
			}
		},

		closeOnOverlayClick: {
			control: 'boolean'
		},

		closeOnEscape: {
			control: 'boolean'
		},

		onClose: {
			action: 'onClose'
		}
	}
}

export default meta

type Story = StoryObj<typeof Sheet>

export const Default: Story = {
	render: args => {
		const [open, setOpen] = useState(false)

		return (
			<div
				style={{
					padding: 32
				}}
			>
				<Button labelText='Open Sheet' onClick={() => setOpen(true)} />

				<Sheet
					{...args}
					open={open}
					onClose={() => {
						setOpen(false)
						args.onClose?.()
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 16
						}}
					>
						<p>Содержимое боковой панели.</p>

						<p>
							Sheet полностью независим от родительского layout и
							отображается поверх страницы.
						</p>
					</div>
				</Sheet>
			</div>
		)
	},

	args: {
		titleText: "Заголовок",
		side: 'right',
		width: 360,
		blur: 6,
		closeOnOverlayClick: true,
		closeOnEscape: true
	}
}

/* -------------------------------------------------
 * Right
 * ------------------------------------------------- */

export const Right: Story = {
	render: args => {
		const [open, setOpen] = useState(false)

		return (
			<div
				style={{
					padding: 32
				}}
			>
				<Button
					labelText='Open right Sheet'
					onClick={() => setOpen(true)}
				/>

				<Sheet
					{...args}
					open={open}
					side='right'
					onClose={() => setOpen(false)}
				>
					<p>Панель появляется с правой стороны экрана.</p>
				</Sheet>
			</div>
		)
	},

	args: {
		titleText: 'RIGHT',
		width: 360
	}
}

/* -------------------------------------------------
 * Left
 * ------------------------------------------------- */

export const Left: Story = {
	render: args => {
		const [open, setOpen] = useState(false)

		return (
			<div
				style={{
					padding: 32
				}}
			>
				<Button
					labelText='Open left Sheet'
					onClick={() => setOpen(true)}
				/>

				<Sheet
					{...args}
					open={open}
					side='left'
					onClose={() => setOpen(false)}
				>
					<p>Панель появляется с левой стороны экрана.</p>
				</Sheet>
			</div>
		)
	},

	args: {
		titleText: 'LEFT',
		side: 'left',
		width: 360
	}
}

export const LongContent: Story = {
	render: args => {
		const [open, setOpen] = useState(false)

		return (
			<div
				style={{
					padding: 32
				}}
			>
				<Button labelText='Open Sheet' onClick={() => setOpen(true)} />

				<Sheet {...args} open={open} onClose={() => setOpen(false)}>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							gap: 24
						}}
					>
						{Array.from({ length: 20 }, (_, index) => (
							<div key={index}>
								<h3>Section {index + 1}</h3>

								<p>
									Это демонстрационный контент для проверки
									прокрутки содержимого Sheet.
								</p>
							</div>
						))}
					</div>
				</Sheet>
			</div>
		)
	},

	args: {
		titleText: "Настройки",
		side: 'right',
		width: 420
	}
}

/* -------------------------------------------------
 * Without overlay closing
 * ------------------------------------------------- */

export const PreventOverlayClose: Story = {
	render: args => {
		const [open, setOpen] = useState(false)

		return (
			<div
				style={{
					padding: 32
				}}
			>
				<Button labelText='Open Sheet' onClick={() => setOpen(true)} />

				<Sheet {...args} open={open} onClose={() => setOpen(false)}>
					<p>Клик по затемнённой области не закрывает Sheet.</p>

					<p>
						Закрыть панель можно кнопкой закрытия или клавишей
						Escape.
					</p>
				</Sheet>
			</div>
		)
	},

	args: {
		titleText: 'TITLE',
		closeOnOverlayClick: false
	}
}
