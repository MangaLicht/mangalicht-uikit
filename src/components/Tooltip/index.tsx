import React, {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.scss';

export type TooltipPosition = 'top' | 'bottom';

export interface TooltipProps {
  /** Содержимое подсказки — текст или произвольный React-узел */
  content: React.ReactNode;
  /** Элемент, при наведении на который появляется подсказка */
  children: React.ReactElement<{
    onMouseEnter?: React.MouseEventHandler;
    onMouseMove?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
  }>;
  /** Появляется над курсором или под курсором */
  position?: TooltipPosition;
  /** Отключить подсказку */
  disabled?: boolean;
  /** Дополнительный className для кастомных стилей подсказки */
  classNames?: string;
  /** Отступ от точки курсора в px */
  offset?: number;
  /** Задержка перед показом, мс */
  showDelay?: number;
  /**
   * Задержка "отставания" подсказки от курсора при движении мыши, мс.
   * 0 (по умолчанию) — подсказка следует мгновенно, без сглаживания.
   * Реализовано через requestAnimationFrame + экспоненциальное сглаживание
   * (а не через CSS transition), поэтому движение остаётся плавным
   * независимо от частоты и неравномерности событий mousemove.
   */
  cursorLag?: number;
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
  disabled = false,
  classNames,
  offset = 12,
  showDelay = 500,
  cursorLag = 100,
}: TooltipProps) => {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // куда указывает курсор прямо сейчас
  const targetPos = useRef({ x: 0, y: 0 });
  // текущая отрисованная позиция (отстаёт от target при cursorLag > 0)
  const currentPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);

  const applyPosition = (x: number, y: number) => {
    if (!tooltipRef.current) return;
    const top = position === 'top' ? y - offset : y + offset;
    tooltipRef.current.style.left = `${x}px`;
    tooltipRef.current.style.top = `${top}px`;
  };

  // основной цикл сглаживания — работает постоянно, пока смонтирован компонент
  useEffect(() => {
    const tick = (time: number) => {
      if (lastFrameTime.current === null) lastFrameTime.current = time;
      const dt = time - lastFrameTime.current;
      lastFrameTime.current = time;

      if (cursorLag <= 0) {
        currentPos.current = { ...targetPos.current };
      } else {
        // экспоненциальное сглаживание с учётом реального времени кадра —
        // скорость "погони" не зависит от частоты обновления экрана (60/120Hz и т.д.)
        const factor = 1 - Math.exp(-dt / cursorLag);
        currentPos.current.x += (targetPos.current.x - currentPos.current.x) * factor;
        currentPos.current.y += (targetPos.current.y - currentPos.current.y) * factor;
      }

      applyPosition(currentPos.current.x, currentPos.current.y);
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      lastFrameTime.current = null;
    };
  }, [cursorLag, position, offset]);

  useEffect(() => {
    return () => {
      if (showTimer.current) window.clearTimeout(showTimer.current);
    };
  }, []);

  if (!isValidElement(children)) return children;

  const clearShowTimer = () => {
    if (showTimer.current) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    children.props.onMouseEnter?.(event);
    if (disabled) return;
    const point = { x: event.clientX, y: event.clientY };
    // при первом наведении телепортируем подсказку сразу к курсору,
    // без "прилёта" издалека — лаг применяется только к последующим движениям
    targetPos.current = point;
    currentPos.current = point;
    applyPosition(point.x, point.y);
    clearShowTimer();
    showTimer.current = window.setTimeout(() => setVisible(true), showDelay);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    children.props.onMouseMove?.(event);
    if (disabled) return;
    targetPos.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    children.props.onMouseLeave?.(event);
    clearShowTimer();
    setVisible(false);
  };

  const trigger = cloneElement(children, {
    onMouseEnter: handleMouseEnter,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  });

  return (
    <>
      {trigger}
      {createPortal(
        <div
          ref={tooltipRef}
          className={[styles.tooltip, classNames].filter(Boolean).join(' ')}
          data-position={position}
          data-visible={visible && !disabled}
          role="tooltip"
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';