import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
	type HTMLAttributes,
	type ReactNode
} from 'react'
import { createPortal } from 'react-dom'

import styles from './DialogWindow.module.scss'

export interface DialogWindowProps extends Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> {
	/**
	 * Состояние окна.
	 */
	isOpen: boolean

	/**
	 * Callback закрытия.
	 */
	onClose: () => void

	/**
	 * Содержимое окна.
	 */
	children: ReactNode

	/**
	 * Дополнительный класс контентного контейнера.
	 */
	className?: string

	/**
	 * Дополнительный класс overlay.
	 */
	overlayClassName?: string

	/**
	 * Закрывать по клику на overlay.
	 */
	closeOnOverlayClick?: boolean

	/**
	 * Закрывать клавишей Escape.
	 */
	closeOnEscape?: boolean

	/**
	 * Продолжительность exit-анимации.
	 *
	 * Должна соответствовать CSS.
	 */
	animationDuration?: number
}

export const DialogWindow = forwardRef<HTMLDivElement, DialogWindowProps>(
	(
		{
			isOpen,
			onClose,
			children,
			className,
			overlayClassName,
			closeOnOverlayClick = true,
			closeOnEscape = true,
			animationDuration = 240,
			onMouseDown,
			...props
		},
		forwardedRef
	) => {
		/**
		 * mounted отвечает за существование
		 * компонента в DOM.
		 *
		 * isOpen отвечает за направление
		 * анимации.
		 *
		 * Благодаря разделению этих состояний
		 * exit-анимация успевает завершиться
		 * до удаления элемента.
		 */
		const [mounted, setMounted] = useState(isOpen)

		const [closing, setClosing] = useState(false)

		const contentRef = useRef<HTMLDivElement | null>(null)

		const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

		useImperativeHandle(
			forwardedRef,
			() => contentRef.current as HTMLDivElement,
			[]
		)

		/**
		 * Управление жизненным циклом
		 * открытия / закрытия.
		 */
		useEffect(() => {
			if (isOpen) {
				if (closeTimerRef.current !== null) {
					clearTimeout(closeTimerRef.current)

					closeTimerRef.current = null
				}

				setMounted(true)

				/**
				 * Переводим компонент в opening
				 * на следующем animation frame,
				 * чтобы браузер успел применить
				 * начальное состояние animation.
				 */
				const frame = requestAnimationFrame(() => {
					setClosing(false)
				})

				return () => {
					cancelAnimationFrame(frame)
				}
			}

			if (!mounted) {
				return
			}

			setClosing(true)

			closeTimerRef.current = setTimeout(() => {
				setMounted(false)
				setClosing(false)
				closeTimerRef.current = null
			}, animationDuration)

			return () => {
				if (closeTimerRef.current !== null) {
					clearTimeout(closeTimerRef.current)

					closeTimerRef.current = null
				}
			}
		}, [isOpen, animationDuration, mounted])

		/**
		 * Блокировка body.
		 *
		 * Важный момент:
		 * body остаётся заблокированным
		 * всё время, пока модальное окно
		 * находится в DOM, включая exit.
		 */
		useEffect(() => {
			if (!mounted) {
				return
			}

			const previousOverflow = document.body.style.overflow

			document.body.style.overflow = 'hidden'

			return () => {
				document.body.style.overflow = previousOverflow
			}
		}, [mounted])

		/**
		 * Escape.
		 */
		useEffect(() => {
			if (!mounted || !isOpen || !closeOnEscape) {
				return
			}

			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key !== 'Escape') {
					return
				}

				event.preventDefault()
				onClose()
			}

			document.addEventListener('keydown', handleKeyDown)

			return () => {
				document.removeEventListener('keydown', handleKeyDown)
			}
		}, [mounted, isOpen, closeOnEscape, onClose])

		/**
		 * Очистка таймера при полном
		 * размонтировании.
		 */
		useEffect(() => {
			return () => {
				if (closeTimerRef.current !== null) {
					clearTimeout(closeTimerRef.current)
				}
			}
		}, [])

		if (!mounted) {
			return null
		}

		const portalRoot =
			document.getElementById('portal-root') ?? document.body

		const handleOverlayMouseDown = (
			event: React.MouseEvent<HTMLDivElement>
		) => {
			if (closeOnOverlayClick && event.target === event.currentTarget) {
				onClose()
			}

			onMouseDown?.(event)
		}

		return createPortal(
			<div
				className={[
					styles.overlay,
					closing ? styles.closing : '',
					overlayClassName
				]
					.filter(Boolean)
					.join(' ')}
				onMouseDown={handleOverlayMouseDown}
				data-dialog-state={closing ? 'closing' : 'open'}
			>
				<div
					ref={contentRef}
					className={[
						styles.content,
						closing ? styles.closing : '',
						className
					]
						.filter(Boolean)
						.join(' ')}
					data-dialog-state={closing ? 'closing' : 'open'}
					{...props}
				>
					{children}
				</div>
			</div>,
			portalRoot
		)
	}
)

DialogWindow.displayName = 'DialogWindow'
