import { Button } from './index'
import { Plus, ArrowRight, XIcon } from 'lucide-react'

const meta = {
	title: 'Components/Button',
	component: Button,
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'highlight',
				'bordered',
				'borderedAccent',
				'ghost',
				'transparent'
			]
		},
		size: {
			control: 'select',
			options: ['default', 'sm']
		},
		buttonType: {
			control: 'select',
			options: ['default', 'rounded', 'square', 'circle']
		},
		disabled: { control: 'boolean' },
		labelText: { control: 'text' },
		isAlert: { control: 'boolean' }
	}
}

export default meta

export const Default = {
	args: {
		labelText: 'Нажми меня',
		variant: 'default'
	}
}

export const Highlight = {
	args: {
		labelText: 'Акцентная кнопка',
		variant: 'highlight'
	}
}

export const Bordered = {
	args: {
		labelText: 'С рамкой',
		variant: 'bordered'
	}
}

export const BorderedAccent = {
	args: {
		labelText: 'С рамкой',
		variant: 'borderedAccent'
	}
}

export const Disabled = {
	args: {
		labelText: 'Недоступно',
		variant: 'default',
		disabled: true
	}
}

export const WithIcon = {
	name: 'With icons (iconStart / iconEnd)',
	render: () => (
		<div style={{ display: 'flex', gap: 12 }}>
			<Button
				labelText='Добавить'
				variant='default'
				iconStart={<Plus aria-hidden='true' />}
				onClick={() => {}}
			/>
			<Button
				labelText='Продолжить'
				variant='bordered'
				iconEnd={<ArrowRight aria-hidden='true' />}
				onClick={() => {}}
			/>
		</div>
	)
}

export const Ghost = {
	args: {
		labelText: 'Прозрачная',
		variant: 'ghost'
	}
}

export const AllVariants = {
	render: () => (
		<div style={{ display: 'flex', gap: 12 }}>
			<Button labelText='Default' variant='default' onClick={() => {}} />
			<Button
				labelText='Highlight'
				variant='highlight'
				onClick={() => {}}
			/>
			<Button
				labelText='Bordered'
				variant='bordered'
				onClick={() => {}}
			/>
			<Button
				labelText='BorderedAccent'
				variant='borderedAccent'
				onClick={() => {}}
			/>
			<Button labelText='Ghost' variant='ghost' onClick={() => {}} />
			<Button
				labelText='Transparent'
				variant='transparent'
				onClick={() => {}}
			/>
			<Button
				labelText='Without Anim'
				variant='default'
				data-animation='none'
				onClick={() => {}}
			/>
			<Button
				labelText='Disabled'
				variant='default'
				disabled
				onClick={() => {}}
			/>
			<Button variant='default' labelText='small size' size='sm' />
			<Button variant='default' labelText='very small size' size='xsm' />
			<Button
				variant='default'
				labelText='rounded'
				buttonType='rounded'
			/>
			<Button
				variant='default'
				labelText='small rounded'
				buttonType='rounded'
				size='sm'
			/>
			<Button
				variant='default'
				labelText='very small rounded'
				buttonType='rounded'
				size='xsm'
			/>
			<Button
				variant='default'
				buttonType='square'
				iconStart={<XIcon size={16} />}
			/>
			<Button
				variant='borderedAccent'
				buttonType='square'
				size='sm'
				iconStart={<XIcon size={16} />}
			/>
			<Button
				variant='ghost'
				buttonType='square'
				size='xsm'
				iconStart={<XIcon size={16} />}
			/>
			<Button
				variant='default'
				buttonType='circle'
				iconStart={<XIcon size={16} />}
			/>
			<Button
				variant='highlight'
				buttonType='circle'
				size='sm'
				iconStart={<XIcon size={16} />}
			/>
			<Button
				variant='bordered'
				buttonType='circle'
				size='xsm'
				iconStart={<XIcon size={16} />}
			/>
		</div>
	)
}
