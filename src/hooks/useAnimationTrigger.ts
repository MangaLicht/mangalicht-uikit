import { useRef, useState, useEffect } from 'react'

/**
 * Хук для запуска одноразовой анимации при изменении значения.
 * Игнорирует первый рендер (маунт), чтобы анимация не срабатывала при появлении компонента.
 *
 * @param triggerValue - значение, при изменении которого нужно запустить анимацию
 * @param duration - длительность анимации в миллисекундах (по умолчанию 500)
 * @returns boolean - флаг, указывающий, что анимация активна
 */
export function useAnimationTrigger(triggerValue: unknown, duration: number = 500): boolean {
  const isFirstRender = useRef(true)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Пропускаем первый рендер
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Запускаем анимацию
    setAnimate(true)

    // Сбрасываем флаг после завершения длительности
    const timeoutId = window.setTimeout(() => {
      setAnimate(false)
    }, duration)

    // Очищаем таймер при размонтировании или повторном срабатывании эффекта
    return () => window.clearTimeout(timeoutId)
  }, [triggerValue, duration])

  return animate
}
