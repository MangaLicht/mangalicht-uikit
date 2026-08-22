import React, { useState } from 'react'
import { Input } from './index'
import { Search } from 'lucide-react'

const meta = {
	title: 'Components/Input',
	component: Input,
	argTypes: {
		disabled: { control: 'boolean' },
		clearable: { control: 'boolean' },
		label: { control: 'text' },
		hint: { control: 'text' },
		placeholder: { control: 'text' }
	}
}

export default meta

/** Управляемый пример с реальным состоянием React — для интерактивных историй */
const ControlledInput = (args: React.ComponentProps<typeof Input>) => {
	const [value, setValue] = useState(args.value ?? args.defaultValue ?? '')
	return (
		<div style={{ width: 320 }}>
			<Input
				{...args}
				value={value}
				onChange={next => {
					setValue(next)
					args.onChange?.(next)
				}}
			/>
		</div>
	)
}

export const Default = {
	render: ControlledInput,
	args: {
		label: 'Имя пользователя',
		placeholder: 'Введите имя'
	}
}

/** Поисковая строка: иконка слева, кнопка очистки, без подписи и валидации */
export const SearchInput = {
	render: ControlledInput,
	args: {
		icon: <Search aria-hidden='true' />,
		placeholder: 'Поиск...',
		clearable: true,
		type: 'search'
	}
}

/** Обязательное поле с минимальной длиной — ошибка появляется по blur */
export const WithValidation = {
	render: ControlledInput,
	args: {
		label: 'Email',
		placeholder: 'name@example.com',
		hint: 'Мы не передаём email третьим лицам',
		rules: {
			required: 'Укажите email',
			pattern: {
				value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
				message: 'Похоже, это не email'
			}
		},
		validateOn: 'change'
	}
}

/** Ошибка, заданная снаружи (например, ответ сервера) — перекрывает внутреннюю валидацию */
export const ServerError = {
	render: ControlledInput,
	args: {
		label: 'Логин',
		defaultValue: 'admin',
		errorMessage: 'Такой логин уже занят'
	}
}

export const Disabled = {
	render: ControlledInput,
	args: {
		label: 'Поле недоступно',
		defaultValue: 'Нельзя редактировать',
		disabled: true
	}
}
