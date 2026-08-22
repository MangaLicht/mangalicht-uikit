import React, {
	cloneElement,
	forwardRef,
	isValidElement,
	useCallback,
	useContext,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState
} from 'react'
import { createPortal } from 'react-dom'
import { getPortalRoot } from '@shared/utils/portalRoot'
import { useAnchoredPosition } from '@hooks/useAnchoredPosition'
import { ChevronIcon } from '@icons/Chevron'
import { DropDownContext } from './context'
import styles from './DropDown.module.scss'

export interface DropDownProps
	extends
		Omit<React.HTMLAttributes<HTMLUListElement>, 'children' | 'onClick'>,
		IUIKitProps {
	/** Пункты меню — DropDownItem и/или вложенные DropDown (подменю) */
	children: React.ReactNode
	/** Контент триггера — только для корневого DropDown. Клонируется через cloneElement */
	trigger?: React.ReactElement
	/** Текст кнопки-триггера по умолчанию (корневой DropDown) ИЛИ текст строки
	 *  подменю (вложенный DropDown) */
	triggerLabel?: string
	/** Фиксированная ширина панели, px. Актуально только для корневого DropDown */
	width?: number
	/** Заблокировать открытие */
	disabled?: boolean
	/** Закрывать меню после клика по листовому DropDownItem. По умолчанию true.
	 *  Задаётся только на корневом DropDown — у вложенных игнорируется, всегда
	 *  используется значение корня. */
	closeOnItemClick?: boolean
	/**
	 * Клик по строке — актуален ТОЛЬКО когда DropDown вложен в другой DropDown
	 * (тогда он рендерится строкой, как DropDownItem). У корневого DropDown
	 * игнорируется: открытие/закрытие управляется кликом по trigger.
	 */
	onClick?: (event: React.MouseEvent<HTMLLIElement>) => void
	/** Иконка перед текстом — актуальна только для вложенного DropDown */
	icon?: React.ReactNode
}

/**
 * DropDown — выпадающее меню с поддержкой вложенных подменю (flyout сбоку).
 * Если у DropDown нет родительского DropDownContext — это корневой дропдаун
 * (кнопка-триггер снизу + панель). Если контекст есть — DropDown вложен в
 * другой DropDown, и тогда рендерится строкой в стиле DropDownItem, а по
 * клику раскрывает СОБСТВЕННУЮ floating-панель сбоку (placement: 'right-start').
 * closeMenu/rootOpen/реестр панелей всегда пробрасываются от корня насквозь,
 * сколько бы уровней вложенности ни было.
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

		// реестр DOM-узлов ВСЕХ floating-панелей поддерева — реально существует
		// только у корня; вложенные DropDown лишь пробрасывают функции дальше
		const panelRegistry = useRef<Set<HTMLElement>>(new Set())

		const registerPanel = useCallback(
			(node: HTMLElement) => {
				if (isNested) parentCtx!.registerPanel(node)
				else panelRegistry.current.add(node)
			},
			[isNested, parentCtx]
		)
		const unregisterPanel = useCallback(
			(node: HTMLElement) => {
				if (isNested) parentCtx!.unregisterPanel(node)
				else panelRegistry.current.delete(node)
			},
			[isNested, parentCtx]
		)
		// hook вызывается безусловно (Rules of Hooks) — выбор значения после
		const rootCloseMenu = useCallback(() => setOpen(false), [])
		const closeMenu = isNested ? parentCtx!.closeMenu : rootCloseMenu
		const parentOpen = isNested ? parentCtx!.parentOpen : true
		const effectiveCloseOnItemClick = isNested
			? parentCtx!.closeOnItemClick
			: closeOnItemClick

		// сброс собственного "открыт" при закрытии корня — чтобы подменю не
		// показывалось уже раскрытым при повторном открытии родителя
		useEffect(() => {
			if (isNested && !parentOpen && open) setOpen(false)
		}, [isNested, parentOpen, open])

		const triggerRef = useRef<HTMLElement | null>(null)
		const setTriggerRef = useCallback(
			(node: HTMLElement | null) => {
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
				matchWidth: false,
				placement: isNested ? 'right-start' : 'bottom-start'
			})

		// регистрируем СВОЮ панель в общем реестре, пока она открыта
		useEffect(() => {
			const node = panelRef.current
			if (!node) return undefined
			if (open) {
				registerPanel(node)
				return () => unregisterPanel(node)
			}
			return undefined
		}, [open, registerPanel, unregisterPanel, panelRef])

		// клик вне ВСЕГО дерева — только у корня. Проверяем не только свой
		// trigger/panel, а ВЕСЬ реестр (включая панели вложенных подменю)
		useEffect(() => {
			if (isNested || !open) return undefined
			const handlePointerDown = (event: PointerEvent) => {
				const target = event.target as Node
				const insideTrigger = triggerRef.current?.contains(target)
				const insideAnyPanel = Array.from(panelRegistry.current).some(
					node => node.contains(target)
				)
				if (!insideTrigger && !insideAnyPanel) setOpen(false)
			}
			document.addEventListener('pointerdown', handlePointerDown)
			return () =>
				document.removeEventListener('pointerdown', handlePointerDown)
		}, [isNested, open])

		// закрытие по скроллу страницы — тоже только у корня, с учётом скролла
		// внутри любой панели дерева (не закрывать, если скроллится сама панель)
		useEffect(() => {
			if (isNested || !open) return undefined
			const handleScroll = (event: Event) => {
				const target = event.target as Node
				const insideAnyPanel = Array.from(panelRegistry.current).some(
					node => node.contains(target)
				)
				if (insideAnyPanel) return
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
			// вложенный DropDown стилизуется и ведёт себя как DropDownItem: клик
			// одновременно вызывает onClick и раскрывает подменю сбоку, но НЕ
			// закрывает корневое меню (в отличие от листового DropDownItem)
			triggerNode = (
				<li
					ref={setTriggerRef as any}
					role='menuitem'
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
							<ChevronIcon />
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
						<ChevronIcon />
					</span>
				</button>
			)
			const triggerSource = trigger ?? defaultTrigger
			if (isValidElement(triggerSource)) {
				const sourceProps = triggerSource.props as React.ButtonHTMLAttributes<HTMLButtonElement> & {
					onClick?: React.MouseEventHandler<HTMLButtonElement>
				}

				triggerNode = cloneElement(triggerSource as React.ReactElement<any>, {
					ref: setTriggerRef,
					onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
						// Сначала сохраняем поведение самого trigger (в том числе Toggle),
						// затем переключаем состояние DropDown. Не заменяем обработчик
						// trigger — это важно для составных компонентов.
						sourceProps.onClick?.(event)

						if (!event.defaultPrevented) {
							toggleOpen()
						}
					},
					'aria-haspopup': 'menu',
					'aria-expanded': open,
					'data-open': open,
					disabled: disabled || sourceProps.disabled
				})
			} else {
				triggerNode = triggerSource
			}
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

		return (
			<>
				{triggerNode}

				{createPortal(
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
								? { ...panelStyle, width: `${width}px` }
								: panelStyle
						}
						{...(!isNested ? rest : {})}
					>
						<DropDownContext.Provider value={contextValue}>
							{children}
						</DropDownContext.Provider>
					</ul>,
					getPortalRoot()
				)}
			</>
		)
	}
)

DropDown.displayName = 'DropDown'

export { DropDownItem } from './DropDownItem'
export type { DropDownItemProps } from './DropDownItem'
