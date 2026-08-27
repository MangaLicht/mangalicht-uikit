import React, { forwardRef, useCallback, useState } from 'react'

import { Button, type ButtonProps } from '@/components/Button'

export interface ToggleProps extends Omit<ButtonProps, 'onClick'> {
	/** Внешний обработчик клика. Выполняется после переключения Toggle. */
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	/**
	 * Состояние Toggle.
	 *
	 * Если передан `checked`, компонент работает
	 * как controlled component.
	 */
	checked?: boolean

	/**
	 * Начальное состояние для uncontrolled режима.
	 */
	defaultChecked?: boolean

	/**
	 * Вызывается после изменения состояния.
	 */
	onCheckedChange?: (
		checked: boolean,
		event: React.MouseEvent<HTMLButtonElement>
	) => void

	/**
	 * Дополнительный класс для активного состояния.
	 */
	activeClassName?: string

	/**
	 * Визуальный вариант Button в активном состоянии.
	 *
	 * По умолчанию используется `highlight`.
	 */
	activeVariant?: ButtonProps['variant']

	/**
	 * Запретить переключение состояния.
	 *
	 * При этом сам Button остаётся доступным для
	 * стандартных событий, если они не заблокированы.
	 */
	toggleDisabled?: boolean
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
	(
		{
			checked: controlledChecked,
			defaultChecked = false,
			onCheckedChange,

			activeClassName,

			activeVariant = 'highlight',

			toggleDisabled = false,

			classNames,
			onClick,

			variant = 'ghost',

			disabled = false,

			...rest
		},
		ref
	) => {
		const [uncontrolledChecked, setUncontrolledChecked] =
			useState(defaultChecked)

		const isControlled = controlledChecked !== undefined

		const checked = isControlled ? controlledChecked : uncontrolledChecked

		const handleClick = useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				if (disabled) {
					return
				}

				const nextChecked = !checked

				if (!isControlled) {
					setUncontrolledChecked(nextChecked)
				}

				onCheckedChange?.(nextChecked, event)
				onClick?.(event)
			},
			[checked, disabled, isControlled, onCheckedChange, onClick]
		)

		return (
			<Button
				ref={ref}
				{...rest}
				disabled={disabled || toggleDisabled}
				variant={checked ? activeVariant : variant}
				aria-pressed={checked}
				data-checked={checked}
				onClick={handleClick}
			/>
		)
	}
)

Toggle.displayName = 'Toggle'
