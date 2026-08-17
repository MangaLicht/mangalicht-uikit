import { useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '../Button'
import { ScrollArea, type ScrollAreaHandle } from './index'

const meta = {
	title: 'Components/ScrollArea',

	component: ScrollArea,

	parameters: {
		layout: 'centered'
	},
	tags: ['autodocs'],

	argTypes: {
		visibleMode: {
			control: 'select',
			options: ['default', 'none', 'scroll']
		},

		axis: {
			control: 'select',
			options: ['vertical', 'horizontal', 'both']
		},

		onScroll: {
			control: false
		},

		children: {
			control: false
		}
	}
} satisfies Meta<typeof ScrollArea>

export default meta

type Story = StoryObj<typeof meta>

const items = Array.from({ length: 40 }, (_, index) => index + 1)

const verticalContent = (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			gap: 8
		}}
	>
		{items.map(item => (
			<div
				key={item}
				style={{
					padding: '14px 16px',
					borderRadius: 8,
					background: 'var(--uikit-bg-block)',
					color: 'var(--uikit-text-main)'
				}}
			>
				Элемент списка №{item}
			</div>
		))}
	</div>
)

export const Default: Story = {
	args: {
		visibleMode: 'default',
		axis: 'vertical'
	},

	render: args => (
		<div
			style={{
				width: 420,
				height: 300
			}}
		>
			<ScrollArea {...args}>{verticalContent}</ScrollArea>
		</div>
	)
}

export const HiddenScrollbar: Story = {
	name: 'visibleMode = none',

	args: {
		visibleMode: 'none',
		axis: 'vertical'
	},

	render: args => (
		<div
			style={{
				width: 420,
				height: 300
			}}
		>
			<ScrollArea {...args}>{verticalContent}</ScrollArea>
		</div>
	)
}

export const ShowWhileScrolling: Story = {
	name: 'visibleMode = scroll',

	args: {
		visibleMode: 'scroll',
		axis: 'vertical'
	},

	render: args => (
		<div
			style={{
				width: 420,
				height: 300
			}}
		>
			<ScrollArea {...args}>{verticalContent}</ScrollArea>
		</div>
	)
}

export const Horizontal: Story = {
	args: {
		visibleMode: 'default',
		axis: 'horizontal'
	},

	render: args => (
		<div
			style={{
				width: 420,
				height: 180
			}}
		>
			<ScrollArea {...args}>
				<div
					style={{
						width: 1800,
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						gap: 12
					}}
				>
					{items.map(item => (
						<div
							key={item}
							style={{
								flex: '0 0 140px',
								height: 100,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								borderRadius: 8,
								background: 'var(--uikit-bg-block)',
								color: 'var(--uikit-text-main)'
							}}
						>
							Карточка {item}
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	)
}

export const BothAxes: Story = {
	name: 'axis = both',

	args: {
		visibleMode: 'default',
		axis: 'both'
	},

	render: args => (
		<div
			style={{
				width: 420,
				height: 280
			}}
		>
			<ScrollArea {...args}>
				<div
					style={{
						width: 1100,
						minHeight: 800,
						padding: 16,
						boxSizing: 'border-box'
					}}
				>
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(8, 130px)',
							gap: 12
						}}
					>
						{Array.from({ length: 80 }, (_, index) => (
							<div
								key={index}
								style={{
									height: 80,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: 8,
									background: 'var(--uikit-bg-block)',
									color: 'var(--uikit-text-main)'
								}}
							>
								{index + 1}
							</div>
						))}
					</div>
				</div>
			</ScrollArea>
		</div>
	)
}

const ScrollToDemo = () => {
	const scrollAreaRef = useRef<ScrollAreaHandle>(null)

	return (
		<div style={{ width: 420 }}>
			<div
				style={{
					display: 'flex',
					gap: 8,
					marginBottom: 12
				}}
			>
				<div style={{ flex: 1 }}>
					<Button
						labelText='В начало'
						variant='bordered'
						onClick={() =>
							scrollAreaRef.current?.scrollTo({
								top: 0,
								behavior: 'smooth'
							})
						}
					/>
				</div>

				<div style={{ flex: 1 }}>
					<Button
						labelText='В конец'
						variant='highlight'
						onClick={() =>
							scrollAreaRef.current?.scrollTo({
								top: Number.MAX_SAFE_INTEGER,
								behavior: 'smooth'
							})
						}
					/>
				</div>
			</div>

			<div
				style={{
					height: 300
				}}
			>
				<ScrollArea
					ref={scrollAreaRef}
					visibleMode='default'
					axis='vertical'
				>
					{verticalContent}
				</ScrollArea>
			</div>
		</div>
	)
}

export const ImperativeScrollTo: Story = {
	name: 'Imperative ref.scrollTo()',

	render: () => <ScrollToDemo />
}
