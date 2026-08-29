import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AlertDialog } from './'
import { Button } from '../Button'

const meta = {
	title: 'Components/AlertDialog',
	component: AlertDialog,
	parameters: {
		layout: 'fullscreen',
		controls: {
			exclude: ['children', 'onClose']
		}
	},
	argTypes: {
		open: {
			control: 'boolean',
			description: 'Определяет, открыт ли AlertDialog.'
		},
		title: {
			control: 'text',
			description: 'Заголовок диалога.'
		},
		description: {
			control: 'text',
			description: 'Описание действия.'
		},
		closeOnOverlayClick: {
			control: 'boolean',
			description: 'Закрывать диалог при клике по затемнённому фону.'
		},
		closeOnEscape: {
			control: 'boolean',
			description: 'Закрывать диалог клавишей Escape.'
		},
		blur: {
			control: {
				type: 'range',
				min: 0,
				max: 20,
				step: 1
			},
			description: 'Степень размытия фона.'
		}
	},
	args: {
		open: false, // ✅ Изменено с true на false
		title: 'Are you absolutely sure?',
		description:
			'This action cannot be undone. This will permanently delete your account from our servers.',
		closeOnOverlayClick: true,
		closeOnEscape: true,
		blur: 6
	}
} satisfies Meta<typeof AlertDialog>

export default meta
type Story = StoryObj<typeof meta>

/**
Базовый AlertDialog.
*/
export const Default: Story = {
	render: args => {
		const [open, setOpen] = useState(args.open)

		return (
			<div
				style={{
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Button
					labelText='Open AlertDialog'
					onClick={() => setOpen(true)}
				/>
				<AlertDialog
					{...args}
					open={open}
					onClose={() => setOpen(false)}
				>
					<Button
						variant='default'
						labelText='Cancel'
						onClick={() => setOpen(false)}
					/>
					<Button
						variant='highlight'
						labelText='Continue'
						onClick={() => setOpen(false)}
					/>
				</AlertDialog>
			</div>
		)
	}
}

/**
Диалог подтверждения удаления.
*/
export const DeleteConfirmation: Story = {
	render: () => {
		const [open, setOpen] = useState(false)

		return (
			<div
				style={{
					minHeight: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Button
					variant='default'
					labelText='Delete account'
					onClick={() => setOpen(true)}
				/>
				<AlertDialog
					open={open}
					title='Are you absolutely sure?'
					description='This action cannot be undone. This will permanently delete your account from our servers.'
					onClose={() => setOpen(false)}
				>
					<Button
						variant='default'
						labelText='Cancel'
						onClick={() => setOpen(false)}
					/>
					<Button
						variant='highlight'
						isAlert={true}
						labelText='Continue'
						onClick={() => {
							console.log('Account deleted')
							setOpen(false)
						}}
					/>
				</AlertDialog>
			</div>
		)
	}
}

/**
Диалог, который нельзя закрыть кликом по overlay.
*/
export const WithoutOverlayClose: Story = {
	render: () => {
		const [open, setOpen] = useState(false) // ✅ Изменено с true на false

		return (
			<div
				style={{
					minHeight: '100vh'
				}}
			>
				<Button
					variant='default'
					labelText='Open Dialog'
					onClick={() => setOpen(true)}
				/>
				<AlertDialog
					open={open}
					title='Unsaved changes'
					description='You have unsaved changes. What would you like to do?'
					closeOnOverlayClick={false}
					onClose={() => setOpen(false)}
				>
					<Button
						variant='ghost'
						labelText='Cancel'
						onClick={() => setOpen(false)}
					/>
					<Button
						variant='highlight'
						labelText='Continue'
						onClick={() => setOpen(false)}
					/>
				</AlertDialog>
			</div>
		)
	}
}

/**
Диалог, который нельзя закрыть через Escape.
*/
export const WithoutEscapeClose: Story = {
	render: () => {
		const [open, setOpen] = useState(false) // ✅ Изменено с true на false

		return (
			<div
				style={{
					minHeight: '100vh'
				}}
			>
				<Button
					variant='default'
					labelText='Open Dialog'
					onClick={() => setOpen(true)}
				/>
				<AlertDialog
					open={open}
					title='Important action'
					description='This dialog must be closed using one of the available actions.'
					closeOnEscape={false}
					onClose={() => setOpen(false)}
				>
					<Button
						variant='default'
						labelText='Cancel'
						onClick={() => setOpen(false)}
					/>
					<Button
						variant='highlight'
						labelText='Continue'
						onClick={() => setOpen(false)}
					/>
				</AlertDialog>
			</div>
		)
	}
}

/**
Проверка размытия фона.
*/
export const Blur: Story = {
	args: {
		blur: 12
	},
	render: args => {
		const [open, setOpen] = useState(false) // ✅ Изменено с true на false

		return (
			<div
				style={{
					minHeight: '100vh',
					padding: 40,
					background: 'linear-gradient(135deg, #161616, #343434)'
				}}
			>
				<div
					style={{
						maxWidth: 600,
						margin: '0 auto',
						color: '#fff'
					}}
				>
					<h1>Background content</h1>
					<p>
						This content should become darkened and blurred when the
						dialog is opened.
					</p>
					<Button
						labelText='Open dialog'
						onClick={() => setOpen(true)}
					/>
				</div>
				<AlertDialog
					{...args}
					open={open}
					onClose={() => setOpen(false)}
				>
					<Button
						variant='default'
						labelText='Cancel'
						onClick={() => setOpen(false)}
					/>
					<Button
						variant='highlight'
						labelText='Continue'
						onClick={() => setOpen(false)}
					/>
				</AlertDialog>
			</div>
		)
	}
}
