import { ButtonHTMLAttributes, useState } from 'react'
import { Tooltip } from './index'

import { Badge } from '../Badge'
import { Block } from '../Block'
import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Input } from '../Input'
import { ProgressBar } from '../ProgressBar'
import { Select } from '../Select'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { TabList } from '../TabList'

const meta = {
	title: 'Components/Tooltip',
	component: Tooltip,
	argTypes: {
		position: {
			control: 'select',
			options: ['top', 'bottom']
		},
		disabled: { control: 'boolean' },
		offset: { control: 'number' },
		showDelay: { control: 'number' },
		cursorLag: { control: 'number' },
		content: { control: 'text' }
	}
	// parameters.layout убран — используется глобальный 'centered' из .storybook/preview.ts
}

export default meta

// простая кнопка-триггер многоразового использования в историях
const TriggerButton = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		{...props}
		style={{
			padding: '8px 16px',
			borderRadius: 8,
			border: '1px solid #cbd5e1',
			background: '#fff',
			cursor: 'pointer',
			font: 'inherit'
		}}
	>
		Наведи на меня
	</button>
)

export const Top = {
	args: {
		content: 'Подсказка сверху',
		position: 'top'
	},
	render: (args: any) => (
		<div style={{ display: 'flex', gap: 12 }}>
			<Tooltip {...args}>
				<Button labelText='Button' />
			</Tooltip>
		</div>
	)
}

export const Bottom = {
	args: {
		content: 'Подсказка снизу',
		position: 'bottom'
	},
	render: (args: any) => (
		<Tooltip {...args}>
			<TriggerButton />
		</Tooltip>
	)
}

export const LongContent = {
	args: {
		content:
			'Длинный текст подсказки, который переносится на несколько строк благодаря max-width в стилях компонента',
		position: 'top'
	},
	render: (args: any) => (
		<Tooltip {...args}>
			<TriggerButton />
		</Tooltip>
	)
}

export const Disabled = {
	args: {
		content: 'Эта подсказка никогда не появится',
		position: 'top',
		disabled: true
	},
	render: (args: any) => (
		<Tooltip {...args}>
			<TriggerButton />
		</Tooltip>
	)
}

export const NoDelay = {
	name: 'Instant show (showDelay = 0)',
	args: {
		content: 'Появляется мгновенно',
		position: 'top',
		showDelay: 0
	},
	render: (args: any) => (
		<Tooltip {...args}>
			<TriggerButton />
		</Tooltip>
	)
}

export const OnPlainText = {
	name: 'On a plain HTML tag',
	args: {
		content: 'Работает и на обычном span',
		position: 'top'
	},
	render: (args: any) => (
		<Tooltip {...args}>
			<span
				style={{ textDecoration: 'underline dotted', cursor: 'help' }}
			>
				Текст с подсказкой
			</span>
		</Tooltip>
	)
}

export const MultipleTriggers = {
	render: () => (
		<div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
			<Tooltip content='Подсказка сверху' position='top'>
				<TriggerButton />
			</Tooltip>
			<Tooltip content='Подсказка снизу' position='bottom'>
				<TriggerButton />
			</Tooltip>
			<Tooltip content='У иконки тоже работает' position='top'>
				<span style={{ fontSize: 20, cursor: 'help' }}>ℹ️</span>
			</Tooltip>
		</div>
	)
}

const tooltipContent = 'Tooltip работает на этом компоненте'

export const AllComponents = {
	name: 'All UI Kit components',
	args: {
		content: tooltipContent,
		position: 'top',
		showDelay: 300,
		cursorLag: 100
	},

	render: (args: React.ComponentProps<typeof Tooltip>) => {
		const [checkboxChecked, setCheckboxChecked] = useState(false)
		const [switchChecked, setSwitchChecked] = useState(false)
		const [selectValue, setSelectValue] = useState<string | undefined>()
		const [sliderValue, setSliderValue] = useState(40)
		const [activeTab, setActiveTab] = useState('first')
		const [inputValue, setInputValue] = useState('')
		const [markdownValue, setMarkdownValue] = useState('')

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: 24,
					width: 600,
					padding: 32
				}}
			>
				<h3 style={{ margin: 0 }}>
					Tooltip — проверка всех компонентов UI Kit
				</h3>

				<p style={{ margin: 0 }}>
					Наведи курсор на каждый компонент. Tooltip должен
					отображаться независимо от внутренней DOM-структуры
					компонента.
				</p>

				{/* Badge */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 48
					}}
				>
					<strong style={{ width: 160 }}>Badge</strong>

					<Tooltip {...args} content='Tooltip на Badge'>
						<Badge variant='bronze' level={67} />
					</Tooltip>
				</div>

				{/* Block */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 80
					}}
				>
					<strong style={{ width: 160 }}>Block</strong>

					<Tooltip {...args} content='Tooltip на Block'>
						<Block
							variant='default'
							width={220}
							height={60}
							title='Block'
						/>
					</Tooltip>
				</div>

				{/* Button */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 48
					}}
				>
					<strong style={{ width: 160 }}>Button</strong>

					<Tooltip {...args} content='Tooltip на Button'>
						<Button labelText='Button' />
					</Tooltip>
				</div>

				{/* Checkbox */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 48
					}}
				>
					<strong style={{ width: 160 }}>Checkbox</strong>

					<Tooltip {...args} content='Tooltip на Checkbox'>
						<Checkbox
							checked={checkboxChecked}
							onClick={setCheckboxChecked}
							labelText='Checkbox'
						/>
					</Tooltip>
				</div>

				{/* Input */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 70
					}}
				>
					<strong style={{ width: 160 }}>Input</strong>

					<Tooltip {...args} content='Tooltip на Input'>
						<Input
							value={inputValue}
							onChange={setInputValue}
							placeholder='Введите текст'
						/>
					</Tooltip>
				</div>

				{/* ProgressBar */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 48
					}}
				>
					<strong style={{ width: 160 }}>ProgressBar</strong>

					<Tooltip {...args} content='Tooltip на ProgressBar'>
						<div style={{ width: 300 }}>
							<ProgressBar min={0} max={100} value={65} />
						</div>
					</Tooltip>
				</div>

				{/* Select */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 48
					}}
				>
					<strong style={{ width: 160 }}>Select</strong>

					<Tooltip {...args} content='Tooltip на Select'>
						<Select
							options={[
								{ value: 'one', label: 'Первый вариант' },
								{ value: 'two', label: 'Второй вариант' },
								{ value: 'three', label: 'Третий вариант' }
							]}
							value={selectValue}
							onChange={setSelectValue}
							placeholder='Выберите вариант'
						/>
					</Tooltip>
				</div>

				{/* Slider */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 48
					}}
				>
					<strong style={{ width: 160 }}>Slider</strong>

					<Tooltip {...args} content='Tooltip на Slider'>
						<div style={{ width: 300 }}>
							<Slider
								min={0}
								max={100}
								value={sliderValue}
								onChange={setSliderValue}
							/>
						</div>
					</Tooltip>
				</div>

				{/* Switch */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 48
					}}
				>
					<strong style={{ width: 160 }}>Switch</strong>

					<Tooltip {...args} content='Tooltip на Switch'>
						<Switch
							checked={switchChecked}
							onChange={setSwitchChecked}
							labelText='Switch'
						/>
					</Tooltip>
				</div>

				{/* TabList */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						minHeight: 64
					}}
				>
					<strong style={{ width: 160 }}>TabList</strong>

					<Tooltip {...args} content='Tooltip на TabList'>
						<TabList
							tabs={[
								{
									id: 'first',
									label: 'Первая'
								},
								{
									id: 'second',
									label: 'Вторая'
								},
								{
									id: 'third',
									label: 'Третья'
								}
							]}
							activeTab={activeTab}
							onTabChange={setActiveTab}
						/>
					</Tooltip>
				</div>
			</div>
		)
	}
}
