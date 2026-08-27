import React, { ButtonHTMLAttributes, forwardRef } from 'react'
import styles from './Button.module.scss'

export type ButtonVariants =
	| 'default'
	| 'highlight'
	| 'bordered'
	| 'borderedAccent'
	| 'ghost'
	| 'transparent'

export type ButtonAnimation = 'default' | 'none'
export type ButtonType = 'default' | 'rounded' | 'square' | 'circle'
export type ButtonSize = 'default' | 'sm' | 'xsm'

const STYLE_TO_CLASS: Record<ButtonVariants, string> = {
	default: styles.default,
	highlight: styles.highlight,
	bordered: styles.bordered,
	borderedAccent: styles.borderedAccent,
	ghost: styles.ghost,
	transparent: styles.transparent
}

export interface ButtonProps extends Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	'children' | 'type' | 'variant'
> {
	/** Заблокировать кнопку */
	disabled?: boolean
	/** Дополнительный className для кастомных стилей */
	classNames?: string
	/** Колбэк клика по кнопке */
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	/** Визуальный вариант оформления */
	variant?: ButtonVariants
	/** Тип кнопки (обычная или скругленная) */
	buttonType?: ButtonType
	/** Размер кнопки */
	size?: ButtonSize
	/** пометка что кнопка должна быть окрашена в красный */
	isAlert?: boolean
	/** Текст лейбла внутри кнопки */
	labelText?: string
	/** type для нативного button, по умолчанию "button" */
	type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
	/** Дочерний элемент (например, svg-иконка) перед текстом лейбла */
	iconStart?: React.ReactNode
	/** Дочерний элемент (например, svg-иконка) после текста лейбла */
	iconEnd?: React.ReactNode
	/** Режимы анимации */
	animation?: ButtonAnimation
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			disabled = false,
			classNames,
			onClick,
			variant = 'default',
			buttonType = 'default',
			size = 'default',
			isAlert = false,
			labelText,
			type = 'button',
			iconStart,
			iconEnd,
			animation = 'default',
			...rest
		},
		ref
	) => {
		const variantClass = STYLE_TO_CLASS[variant] ?? styles.default

		return (
			<button
				ref={ref}
				type={type}
				className={[styles.button, variantClass, classNames]
					.filter(Boolean)
					.join(' ')}
				disabled={disabled}
				data-animation={animation}
				data-type={buttonType}
				data-size={size}
				data-alert={isAlert}
				onClick={onClick}
				{...rest}
			>
				{iconStart ? (
					<span className={styles.icon} aria-hidden='true'>
						{iconStart}
					</span>
				) : null}
				{labelText && <span>{labelText}</span>}
				{iconEnd ? (
					<span className={styles.icon} aria-hidden='true'>
						{iconEnd}
					</span>
				) : null}
			</button>
		)
	}
)

Button.displayName = 'Button'
