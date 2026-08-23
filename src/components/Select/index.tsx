import React, {
	forwardRef,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'
import { getPortalRoot } from '@shared/utils/portalRoot'
import { useClickOutside } from '@hooks/useClickOutside'
import { useAnchoredPosition } from '@hooks/useAnchoredPosition'
import {
	ScrollArea,
	type ScrollAreaHandle
} from '@components/ScrollArea'
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
	options: SelectOption[]
	value?: string
	defaultValue?: string
	onChange?: (value: string) => void
	disabled?: boolean
	classNames?: string
	placeholder?: string
	name?: string
	minWidth?: number
}

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
		const panelRef = useRef<HTMLDivElement | null>(null)
		const scrollAreaRef = useRef<ScrollAreaHandle | null>(null)

		const setTriggerRef = useCallback(
			(node: HTMLButtonElement | null) => {
				triggerRef.current = node
				if (typeof forwardedRef === 'function') forwardedRef(node)
				else if (forwardedRef) forwardedRef.current = node
			},
			[forwardedRef]
		)

		const { style: panelStyle } = useAnchoredPosition<HTMLDivElement>(
			triggerRef,
			{
				open,
				offset: 4,
				matchWidth: true,
				panelRef
			}
		)

		useClickOutside([triggerRef, panelRef], () => setOpen(false), open)

		useEffect(() => {
			if (!open) return undefined

			const handleScroll = (event: Event) => {
				const target = event.target
				if (target instanceof Node && panelRef.current?.contains(target)) {
					return
				}
				setOpen(false)
			}

			window.addEventListener('scroll', handleScroll, true)
			return () => window.removeEventListener('scroll', handleScroll, true)
		}, [open])

		const selectedIndex = options.findIndex(option => option.value === currentValue)
		const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

		const commitValue = useCallback(
			(nextValue: string) => {
				if (!isControlled) setInternalValue(nextValue)
				onChange?.(nextValue)
				setOpen(false)
				triggerRef.current?.focus()
			},
			[isControlled, onChange]
		)

		const openMenu = useCallback(() => {
			if (disabled) return
			setOpen(true)
			setHighlightedIndex(
				selectedIndex >= 0
					? selectedIndex
					: findNextEnabled(options, -1, 1)
			)
		}, [disabled, options, selectedIndex])

		const handleTriggerKeyDown = (
			event: React.KeyboardEvent<HTMLButtonElement>
		) => {
			if (disabled) return

			if (!open) {
				if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
					event.preventDefault()
					openMenu()
				}
				return
			}

			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault()
					setHighlightedIndex(index => findNextEnabled(options, index, 1))
					break
				case 'ArrowUp':
					event.preventDefault()
					setHighlightedIndex(index => findNextEnabled(options, index, -1))
					break
				case 'Home':
					event.preventDefault()
					setHighlightedIndex(findNextEnabled(options, -1, 1))
					break
				case 'End':
					event.preventDefault()
					setHighlightedIndex(findNextEnabled(options, options.length, -1))
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

		useEffect(() => {
			if (!open || selectedIndex < 0) return

			const frame = requestAnimationFrame(() => {
				const option = document.getElementById(
					`${listboxId}-option-${selectedIndex}`
				)
				const container = panelRef.current

				if (!option || !container || !scrollAreaRef.current) return

				const optionTop = option.offsetTop
				const optionBottom = optionTop + option.offsetHeight
				const visibleTop = container.scrollTop
				const visibleBottom = visibleTop + container.clientHeight

				if (optionTop < visibleTop) {
					scrollAreaRef.current.scrollTo({ top: optionTop })
				} else if (optionBottom > visibleBottom) {
					scrollAreaRef.current.scrollTo({
						top: optionBottom - container.clientHeight
					})
				}
			})

			return () => cancelAnimationFrame(frame)
		}, [listboxId, open, selectedIndex])

		const panel = open ? (
			<ScrollArea
				ref={scrollAreaRef}
				elementRef={panelRef}
				id={listboxId}
				role='listbox'
				classNames={styles.panel}
				style={panelStyle}
				axis='vertical'
				visibleMode='scroll'
			>
				{options.map((option, index) => (
					<div
						key={option.value}
						id={`${listboxId}-option-${index}`}
						role='option'
						aria-selected={option.value === currentValue}
						aria-disabled={option.disabled}
						className={styles.option}
						data-highlighted={index === highlightedIndex}
						data-selected={option.value === currentValue}
						data-disabled={option.disabled}
						onMouseEnter={() => setHighlightedIndex(index)}
						onClick={() => {
							if (!option.disabled) commitValue(option.value)
						}}
					>
						{option.label}
					</div>
				))}
			</ScrollArea>
		) : null

		return (
			<>
				<button
					ref={setTriggerRef}
					type='button'
					style={{ minWidth: `${minWidth}px` }}
					className={[styles.trigger, classNames].filter(Boolean).join(' ')}
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
					<span className={styles.valueText} data-placeholder={!selectedOption}>
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

				{panel && typeof document !== 'undefined'
					? createPortal(panel, getPortalRoot())
					: null}
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
		const index = (from + dir * step + len) % len
		if (!options[index]?.disabled) return index
	}
	return from
}
