import type { IUIKitProps } from '@shared/types/IUIKitProps'
import React, {
	cloneElement,
	forwardRef,
	isValidElement,
	useCallback,
	useContext,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { createPortal } from 'react-dom'
import { getPortalRoot } from '@shared/utils/portalRoot'
import { ChevronDown } from 'lucide-react'
import { DropDownContext } from './context'
import styles from './DropDown.module.scss'

export type DropDownPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto'

export interface DropDownProps
	extends
		Omit<React.HTMLAttributes<HTMLUListElement>, 'children' | 'onClick'>,
		IUIKitProps {
	/** Пункты меню — DropDownItem и/или вложенные DropDown (подменю) */
	children: React.ReactNode

	/** Контент триггера — только для корневого DropDown */
	trigger?: React.ReactElement

	/** Текст кнопки-триггера по умолчанию или текст строки подменю */
	triggerLabel?: string

	/** Фиксированная ширина панели, px. Актуально только для корневого DropDown */
	width?: number

	/** Заблокировать открытие */
	disabled?: boolean

	/** Закрывать меню после клика по листовому DropDownItem */
	closeOnItemClick?: boolean

	/**
	 * Сторона открытия меню относительно триггера.
	 *
	 * top    — сверху
	 * bottom — снизу
	 * left   — слева
	 * right  — справа
	 * auto   — автоматически выбирает сторону с достаточным местом
	 *
	 * По умолчанию: bottom.
	 *
	 * Для вложенных DropDown сохраняется существующее поведение:
	 * подменю открывается вправо от родительского пункта.
	 */
	placement?: DropDownPlacement

	/**
	 * Клик по строке — актуален ТОЛЬКО когда DropDown вложен
	 * в другой DropDown.
	 */
	onClick?: (event: React.MouseEvent<HTMLLIElement>) => void

	/** Иконка перед текстом — актуальна только для вложенного DropDown */
	icon?: React.ReactNode
}

interface DropDownTriggerProps extends React.HTMLAttributes<HTMLElement> {
	onClick?: (event: React.MouseEvent<HTMLElement>) => void
	disabled?: boolean
	ref?: React.Ref<any>
	[key: string]: any
}

interface PanelPosition {
	left: number
	top: number
	placement: Exclude<DropDownPlacement, 'auto'>
}

const VIEWPORT_PADDING = 4
const PANEL_OFFSET = 4

/**
 * Ограничивает координату так, чтобы панель оставалась
 * внутри viewport.
 */
const clamp = (value: number, min: number, max: number): number => {
	if (max < min) return min
	return Math.min(Math.max(value, min), max)
}

/**
 * Проверяет, помещается ли меню целиком в указанном направлении.
 */
const fitsInPlacement = (
	placement: Exclude<DropDownPlacement, 'auto'>,
	triggerRect: DOMRect,
	panelRect: DOMRect,
	viewportWidth: number,
	viewportHeight: number
): boolean => {
	switch (placement) {
		case 'bottom':
			return (
				triggerRect.bottom + PANEL_OFFSET + panelRect.height <=
				viewportHeight - VIEWPORT_PADDING
			)

		case 'top':
			return (
				triggerRect.top - PANEL_OFFSET - panelRect.height >=
				VIEWPORT_PADDING
			)

		case 'right':
			return (
				triggerRect.right + PANEL_OFFSET + panelRect.width <=
				viewportWidth - VIEWPORT_PADDING
			)

		case 'left':
			return (
				triggerRect.left - PANEL_OFFSET - panelRect.width >=
				VIEWPORT_PADDING
			)
	}
}

/**
 * Возвращает количество свободного места с каждой стороны триггера.
 */
const getAvailableSpace = (
	triggerRect: DOMRect,
	viewportWidth: number,
	viewportHeight: number
) => ({
	top: triggerRect.top - VIEWPORT_PADDING,
	bottom: viewportHeight - triggerRect.bottom - VIEWPORT_PADDING,
	left: triggerRect.left - VIEWPORT_PADDING,
	right: viewportWidth - triggerRect.right - VIEWPORT_PADDING
})

/**
 * Рассчитывает итоговую позицию панели.
 *
 * Для статического placement направление никогда не меняется.
 *
 * Для auto:
 * bottom -> top -> right -> left.
 *
 * Если меню не помещается полностью ни в одном направлении,
 * выбирается сторона с наибольшим доступным пространством,
 * после чего координаты ограничиваются viewport.
 */
const calculatePanelPosition = (
	trigger: HTMLElement,
	panel: HTMLElement,
	requestedPlacement: Exclude<DropDownPlacement, 'auto'> | 'auto'
): PanelPosition | null => {
	const triggerRect = trigger.getBoundingClientRect()
	const panelRect = panel.getBoundingClientRect()

	const viewportWidth = window.innerWidth
	const viewportHeight = window.innerHeight

	let placement: Exclude<DropDownPlacement, 'auto'>

	if (requestedPlacement === 'auto') {
		const priority: Array<Exclude<DropDownPlacement, 'auto'>> = [
			'bottom',
			'top',
			'right',
			'left'
		]

		const fittingPlacement = priority.find(current =>
			fitsInPlacement(
				current,
				triggerRect,
				panelRect,
				viewportWidth,
				viewportHeight
			)
		)

		if (fittingPlacement) {
			placement = fittingPlacement
		} else {
			const available = getAvailableSpace(
				triggerRect,
				viewportWidth,
				viewportHeight
			)

			placement = (
				Object.entries(available) as Array<
					[Exclude<DropDownPlacement, 'auto'>, number]
				>
			).sort((a, b) => b[1] - a[1])[0][0]
		}
	} else {
		placement = requestedPlacement
	}

	let left: number
	let top: number

	switch (placement) {
		case 'bottom': {
			left = triggerRect.left + (triggerRect.width - panelRect.width) / 2

			top = triggerRect.bottom + PANEL_OFFSET

			break
		}

		case 'top': {
			left = triggerRect.left + (triggerRect.width - panelRect.width) / 2

			top = triggerRect.top - panelRect.height - PANEL_OFFSET

			break
		}

		case 'right': {
			left = triggerRect.right + PANEL_OFFSET

			top = triggerRect.top + (triggerRect.height - panelRect.height) / 2

			break
		}

		case 'left': {
			left = triggerRect.left - panelRect.width - PANEL_OFFSET

			top = triggerRect.top + (triggerRect.height - panelRect.height) / 2

			break
		}
	}

	/**
	 * Даже в static-режиме не позволяем панели физически
	 * уйти за viewport.
	 *
	 * Само направление при этом НЕ меняется.
	 */
	left = clamp(
		left,
		VIEWPORT_PADDING,
		viewportWidth - panelRect.width - VIEWPORT_PADDING
	)

	top = clamp(
		top,
		VIEWPORT_PADDING,
		viewportHeight - panelRect.height - VIEWPORT_PADDING
	)

	return {
		left: Math.round(left),
		top: Math.round(top),
		placement
	}
}

/**
 * DropDown — выпадающее меню с поддержкой вложенных подменю.
 */
export const DropDown = forwardRef<HTMLElement, DropDownProps>(
	(
		{
			children,
			trigger,
			triggerLabel = 'Меню',
			width,
			disabled = false,
			closeOnItemClick = true,
			placement = 'bottom',
			classNames,
			onClick,
			icon,
			...rest
		},
		forwardedRef
	) => {
		const parentCtx = useContext(DropDownContext)
		const isNested = parentCtx !== null

		const [open, setOpen] = useState(false)
		const submenuId = useId()

		const panelRegistry = useRef<Set<HTMLElement>>(new Set())

		const [panelPosition, setPanelPosition] =
			useState<PanelPosition | null>(null)

		const registerPanel = useCallback(
			(node: HTMLElement) => {
				if (isNested) {
					parentCtx!.registerPanel(node)
				} else {
					panelRegistry.current.add(node)
				}
			},
			[isNested, parentCtx]
		)

		const unregisterPanel = useCallback(
			(node: HTMLElement) => {
				if (isNested) {
					parentCtx!.unregisterPanel(node)
				} else {
					panelRegistry.current.delete(node)
				}
			},
			[isNested, parentCtx]
		)

		const rootCloseMenu = useCallback(() => setOpen(false), [])

		const closeMenu = isNested ? parentCtx!.closeMenu : rootCloseMenu

		const parentOpen = isNested ? parentCtx!.parentOpen : true

		const effectiveCloseOnItemClick = isNested
			? parentCtx!.closeOnItemClick
			: closeOnItemClick

		/**
		 * Закрытие вложенных уровней при закрытии родителя.
		 */
		useEffect(() => {
			if (isNested && !parentOpen && open) {
				setOpen(false)
			}
		}, [isNested, parentOpen, open])

		const triggerRef = useRef<HTMLElement | null>(null)

		const panelRef = useRef<HTMLUListElement | null>(null)

		const setTriggerRef = useCallback(
			(node: HTMLElement | null) => {
				triggerRef.current = node

				if (typeof forwardedRef === 'function') {
					forwardedRef(node)
				} else if (forwardedRef) {
					forwardedRef.current = node
				}
			},
			[forwardedRef]
		)

		/**
		 * Для корневого DropDown используется placement,
		 * заданный пользователем.
		 *
		 * Для вложенных меню сохраняем старое поведение:
		 * submenu -> right.
		 */
		const effectivePlacement: DropDownPlacement = isNested
			? 'right'
			: placement

		/**
		 * Основной расчёт позиции.
		 *
		 * useLayoutEffect нужен для того, чтобы получить реальные
		 * размеры панели после её появления в DOM, но до отрисовки
		 * следующего кадра.
		 */
		const recalculatePosition = useCallback(() => {
			const trigger = triggerRef.current
			const panel = panelRef.current

			if (!trigger || !panel || !open) {
				return
			}

			const result = calculatePanelPosition(
				trigger,
				panel,
				effectivePlacement
			)

			if (!result) return

			setPanelPosition(result)
		}, [effectivePlacement, open])

		useLayoutEffect(() => {
			if (!open) {
				setPanelPosition(null)
				return undefined
			}

			let frame = 0

			/**
			 * Первый расчёт откладываем на animation frame,
			 * чтобы браузер уже успел получить реальные размеры
			 * портальной панели.
			 */
			frame = requestAnimationFrame(() => {
				recalculatePosition()
			})

			const handleResize = () => {
				recalculatePosition()
			}

			const handleScroll = () => {
				recalculatePosition()
			}

			window.addEventListener('resize', handleResize)

			window.addEventListener('scroll', handleScroll, true)

			const panel = panelRef.current

			let resizeObserver: ResizeObserver | undefined

			if (panel && typeof ResizeObserver !== 'undefined') {
				resizeObserver = new ResizeObserver(() => {
					recalculatePosition()
				})

				resizeObserver.observe(panel)
			}

			return () => {
				cancelAnimationFrame(frame)

				window.removeEventListener('resize', handleResize)

				window.removeEventListener('scroll', handleScroll, true)

				resizeObserver?.disconnect()
			}
		}, [open, recalculatePosition])

		/**
		 * Если ширина панели меняется через prop width,
		 * повторно вычисляем координаты после изменения DOM.
		 */
		useLayoutEffect(() => {
			if (!open) return

			const frame = requestAnimationFrame(() => {
				recalculatePosition()
			})

			return () => cancelAnimationFrame(frame)
		}, [width, open, recalculatePosition])

		/**
		 * Регистрируем собственную панель в общем реестре.
		 */
		useEffect(() => {
			const node = panelRef.current

			if (!node || !open) {
				return undefined
			}

			registerPanel(node)

			return () => {
				unregisterPanel(node)
			}
		}, [open, registerPanel, unregisterPanel])

		/**
		 * Закрытие при клике за пределами всего дерева DropDown.
		 */
		useEffect(() => {
			if (isNested || !open) {
				return undefined
			}

			const handlePointerDown = (event: PointerEvent) => {
				const target = event.target as Node

				const insideTrigger = triggerRef.current?.contains(target)

				const insideAnyPanel = Array.from(panelRegistry.current).some(
					node => node.contains(target)
				)

				if (!insideTrigger && !insideAnyPanel) {
					setOpen(false)
				}
			}

			document.addEventListener('pointerdown', handlePointerDown)

			return () =>
				document.removeEventListener('pointerdown', handlePointerDown)
		}, [isNested, open])

		/**
		 * Закрытие по скроллу страницы.
		 *
		 * Скролл внутри любой панели DropDown
		 * не закрывает меню.
		 */
		useEffect(() => {
			if (isNested || !open) {
				return undefined
			}

			const handleScroll = (event: Event) => {
				const target = event.target as Node

				const insideAnyPanel = Array.from(panelRegistry.current).some(
					node => node.contains(target)
				)

				if (insideAnyPanel) {
					return
				}

				setOpen(false)
			}

			window.addEventListener('scroll', handleScroll, true)

			return () =>
				window.removeEventListener('scroll', handleScroll, true)
		}, [isNested, open])

		const toggleOpen = () => {
			if (disabled) return

			setOpen(prev => !prev)
		}

		let triggerNode: React.ReactElement

		if (isNested) {
			triggerNode = (
				<li
					ref={setTriggerRef}
					role='menuitem'
					tabIndex={disabled ? -1 : 0}
					className={[styles.item, classNames]
						.filter(Boolean)
						.join(' ')}
					data-disabled={disabled}
					data-expanded={open}
					aria-disabled={disabled}
					aria-haspopup='menu'
					aria-expanded={open}
					aria-controls={submenuId}
					onClick={(event: React.MouseEvent<HTMLLIElement>) => {
						if (disabled) return

						onClick?.(event)
						toggleOpen()
					}}
					onKeyDown={(event: React.KeyboardEvent<HTMLLIElement>) => {
						if (disabled) return

						if (event.key === 'ArrowLeft') {
							event.preventDefault()
							event.stopPropagation()
							setOpen(false)
						}

						if (event.key === 'ArrowRight' && !open) {
							event.preventDefault()
							setOpen(true)
						}
					}}
				>
					<span className={styles.itemRow}>
						{icon ? (
							<span
								className={styles.itemIcon}
								aria-hidden='true'
							>
								{icon}
							</span>
						) : null}

						<span className={styles.itemLabel}>{triggerLabel}</span>

						<span
							className={styles.itemChevron}
							data-expanded={open}
						>
							<ChevronDown aria-hidden='true' />
						</span>
					</span>
				</li>
			)
		} else {
			const defaultTrigger = (
				<button
					type='button'
					className={styles.defaultTrigger}
					disabled={disabled}
				>
					<span>{triggerLabel}</span>

					<span className={styles.chevron} data-open={open}>
						<ChevronDown aria-hidden='true' />
					</span>
				</button>
			)

			const triggerSource = trigger ?? defaultTrigger

			const typedTriggerSource =
				triggerSource as React.ReactElement<DropDownTriggerProps>

			triggerNode = isValidElement(typedTriggerSource)
				? cloneElement(typedTriggerSource, {
						ref: setTriggerRef,

						onClick: (event: React.MouseEvent<HTMLElement>) => {
							typedTriggerSource.props.onClick?.(event)

							toggleOpen()
						},

						'aria-haspopup': 'menu',
						'aria-expanded': open,
						'data-open': open,

						disabled: disabled || typedTriggerSource.props.disabled
					})
				: triggerSource
		}

		const contextValue = useMemo(
			() => ({
				closeMenu,
				closeOnItemClick: effectiveCloseOnItemClick,
				parentOpen: open,
				registerPanel,
				unregisterPanel
			}),
			[
				closeMenu,
				effectiveCloseOnItemClick,
				open,
				registerPanel,
				unregisterPanel
			]
		)

		const calculatedStyle: React.CSSProperties = {
			position: 'fixed',
			left: panelPosition?.left ?? 0,
			top: panelPosition?.top ?? 0,
			visibility: open && panelPosition ? 'visible' : 'hidden'
		}

		return (
			<>
				{triggerNode}

				{typeof document !== 'undefined'
					? createPortal(
							<ul
								ref={panelRef}
								id={isNested ? submenuId : undefined}
								role='menu'
								className={[
									styles.panel,
									'uikit_rounded',
									!isNested && classNames
								]
									.filter(Boolean)
									.join(' ')}
								data-open={open}
								style={
									!isNested && width !== undefined
										? {
												...calculatedStyle,
												width: `${width}px`
											}
										: calculatedStyle
								}
								{...(!isNested ? rest : {})}
							>
								<DropDownContext.Provider value={contextValue}>
									{children}
								</DropDownContext.Provider>
							</ul>,
							getPortalRoot()
						)
					: null}
			</>
		)
	}
)

DropDown.displayName = 'DropDown'

export {
	DropDownItem,
	type DropDownItemProps
} from '@/components/DropDown/DropDownItem'
