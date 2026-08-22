import React, {
	forwardRef,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState
} from 'react'
import { createPortal } from 'react-dom'
import { getPortalRoot } from '@shared/utils/portalRoot'
import { useClickOutside } from '@hooks/useClickOutside'
import { useAnchoredPosition } from '@hooks/useAnchoredPosition'
import { ChevronDown } from 'lucide-react'
import styles from './Select.module.scss'

export interface SelectOption {
	value: string
	label: string
	disabled?: boolean
}

export interface SelectProps extends Omit<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	'value' | 'defaultValue' | 'onChange' | 'children' | 'type'
> {
	/** Список опций */
	options: SelectOption[]
	/** Текущее значение — если передано, компонент становится управляемым */
	value?: string
	/** Начальное значение для неуправляемого использования */
	defaultValue?: string
	/** Колбэк выбора, получает value выбранной опции */
	onChange?: (value: string) => void
	/** Заблокировать select */
	disabled?: boolean
	/** Дополнительный className для кастомных стилей */
	classNames?: string
	/** Текст-заглушка, когда ничего не выбрано */
	placeholder?: string
	/** name для скрытого input, полезно для нативных форм */
	name?: string
	/** ручное указание минимальной ширины контейнера */
	minWidth?: number
}

/**
 * Select — кастомный выпадающий список, построенный на архитектурных
 * паттернах остального кита:
 *  - forwardRef + controlled/uncontrolled гибрид (как Checkbox)
 *  - {...rest} проброс нативных атрибутов button (как Button/Switch —
 *    например, чтобы Tooltip мог навесить обработчики через cloneElement)
 *  - выпадающая панель рендерится в портал document.body,
 *    чтобы не резалась overflow/z-index родителей
 *  - позиционирование и закрытие по клику вне вынесены в переиспользуемые
 *    хуки useAnchoredPosition / useClickOutside
 *  - доступность: паттерн collapsible listbox с aria-activedescendant —
 *    фокус остаётся на триггере, стрелки/Enter/Escape работают с клавиатуры
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
	(
		{
			options,
			value,
			defaultValue,
			onChange,
			disabled = false,
			classNames,
			placeholder = 'Выберите значение',
			name,
			minWidth = 220,
			...rest
		},
		forwardedRef
	) => {
		const generatedId = useId()
		const listboxId = `uikit-select-listbox-${generatedId}`

		const isControlled = value !== undefined
		const [internalValue, setInternalValue] = useState(defaultValue)
		const currentValue = isControlled ? value : internalValue

		const [open, setOpen] = useState(false)
		const [highlightedIndex, setHighlightedIndex] = useState(-1)

		const triggerRef = useRef<HTMLButtonElement | null>(null)
		// мёржим внешний ref (forwardRef) с внутренним, нужным для позиционирования
		const setTriggerRef = useCallback(
			(node: HTMLButtonElement | null) => {
				triggerRef.current = node
				if (typeof forwardedRef === 'function') forwardedRef(node)
				else if (forwardedRef) forwardedRef.current = node
			},
			[forwardedRef]
		)

		const { panelRef, style: panelStyle } =
			useAnchoredPosition<HTMLUListElement>(triggerRef, {
				open,
				offset: 4,
				matchWidth: true
			})

		useClickOutside([triggerRef, panelRef], () => setOpen(false), open)

		// закрываем при скролле страницы (кроме скролла внутри самой панели —
		// список опций может быть длиннее max-height и скроллиться сам по себе)
		useEffect(() => {
			if (!open) return undefined
			const handleScroll = (event: Event) => {
				if (panelRef.current?.contains(event.target as Node)) return
				setOpen(false)
			}
			window.addEventListener('scroll', handleScroll, true)
			return () =>
				window.removeEventListener('scroll', handleScroll, true)
		}, [open, panelRef])

		const selectedIndex = options.findIndex(o => o.value === currentValue)
		const selectedOption =
			selectedIndex >= 0 ? options[selectedIndex] : undefined

		const commitValue = (nextValue: string) => {
			if (!isControlled) setInternalValue(nextValue)
			onChange?.(nextValue)
			setOpen(false)
			triggerRef.current?.focus()
		}

		const openMenu = () => {
			if (disabled) return
			setOpen(true)
			setHighlightedIndex(
				selectedIndex >= 0
					? selectedIndex
					: findNextEnabled(options, -1, 1)
			)
		}

		const handleTriggerKeyDown = (
			event: React.KeyboardEvent<HTMLButtonElement>
		) => {
			if (disabled) return

			if (!open) {
				if (
					['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)
				) {
					event.preventDefault()
					openMenu()
				}
				return
			}

			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault()
					setHighlightedIndex(i => findNextEnabled(options, i, 1))
					break
				case 'ArrowUp':
					event.preventDefault()
					setHighlightedIndex(i => findNextEnabled(options, i, -1))
					break
				case 'Home':
					event.preventDefault()
					setHighlightedIndex(findNextEnabled(options, -1, 1))
					break
				case 'End':
					event.preventDefault()
					setHighlightedIndex(
						findNextEnabled(options, options.length, -1)
					)
					break
				case 'Enter':
				case ' ': {
					event.preventDefault()
					const option = options[highlightedIndex]
					if (option && !option.disabled) commitValue(option.value)
					break
				}
				case 'Escape':
					event.preventDefault()
					setOpen(false)
					break
				default:
					break
			}
		}

		return (
			<>
				<button
					ref={setTriggerRef}
					type='button'
					style={{ minWidth: `${minWidth}px` }}
					className={[styles.trigger, classNames]
						.filter(Boolean)
						.join(' ')}
					disabled={disabled}
					aria-haspopup='listbox'
					aria-expanded={open}
					aria-controls={listboxId}
					aria-activedescendant={
						open && highlightedIndex >= 0
							? `${listboxId}-option-${highlightedIndex}`
							: undefined
					}
					data-open={open}
					data-disabled={disabled}
					onClick={() => (open ? setOpen(false) : openMenu())}
					onKeyDown={handleTriggerKeyDown}
					{...rest}
				>
					<span
						className={styles.valueText}
						data-placeholder={!selectedOption}
					>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<span className={styles.chevron} data-open={open}>
						<ChevronDown aria-hidden='true' />
					</span>
				</button>

				{name ? (
					<input
						type='hidden'
						name={name}
						value={currentValue ?? ''}
						readOnly
					/>
				) : null}

				{createPortal(
					<ul
						ref={panelRef}
						id={listboxId}
						role='listbox'
						className={styles.panel}
						data-open={open}
						style={panelStyle}
					>
						{options.map((option, index) => (
							<li
								key={option.value}
								id={`${listboxId}-option-${index}`}
								role='option'
								aria-selected={option.value === currentValue}
								className={styles.option}
								data-highlighted={index === highlightedIndex}
								data-selected={option.value === currentValue}
								data-disabled={option.disabled}
								onMouseEnter={() => setHighlightedIndex(index)}
								onClick={() =>
									!option.disabled &&
									commitValue(option.value)
								}
							>
								{option.label}
							</li>
						))}
					</ul>,
					getPortalRoot()
				)}
			</>
		)
	}
)

Select.displayName = 'Select'

function findNextEnabled(
	options: SelectOption[],
	from: number,
	dir: 1 | -1
): number {
	const len = options.length
	for (let step = 1; step <= len; step += 1) {
		const idx = (from + dir * step + len) % len
		if (!options[idx]?.disabled) return idx
	}
	return from
}
