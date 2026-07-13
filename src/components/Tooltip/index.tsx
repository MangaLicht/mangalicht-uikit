import React, {
  cloneElement,
  isValidElement,
  useCallback,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { getPortalRoot } from '../../shared/utils/portalRoot';
import { useMouseTracking } from '../../hooks/useMouseTracking';
import { useSmoothFollow } from '../../hooks/useSmoothFollow';
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

  // применяем расчитанную позицию
  const applyPosition = useCallback(
    (el: HTMLDivElement, x: number, y: number) => {
      const top = position === 'top' ? y - offset : y + offset;
      el.style.left = `${x}px`;
      el.style.top = `${top}px`;
    },
    [position, offset],
  );

  // плавное отставание
  const { elementRef: tooltipRef, setTarget } = useSmoothFollow<HTMLDivElement>(
    applyPosition,
    { lag: cursorLag, enabled: visible },
  );

  const clearShowTimer = () => {
    if (showTimer.current) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  };

  // сырые координаты мыши
  const { handlers: mouseHandlers } = useMouseTracking({
    onEnter: (x, y) => {
      if (disabled) return;
      setTarget(x, y, { teleport: true });
      clearShowTimer();
      showTimer.current = window.setTimeout(() => setVisible(true), showDelay);
    },
    onMove: (x, y) => {
      if (disabled) return;
      setTarget(x, y);
    },
    onLeave: () => {
      clearShowTimer();
      setVisible(false);
    },
  });

  if (!isValidElement(children)) return children;

  const trigger = cloneElement(children, {
    onMouseEnter: (event: React.MouseEvent) => {
      children.props.onMouseEnter?.(event);
      mouseHandlers.onMouseEnter(event);
    },
    onMouseMove: (event: React.MouseEvent) => {
      children.props.onMouseMove?.(event);
      mouseHandlers.onMouseMove(event);
    },
    onMouseLeave: (event: React.MouseEvent) => {
      children.props.onMouseLeave?.(event);
      mouseHandlers.onMouseLeave(event);
    },
  });

  // разметка компонента
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
        getPortalRoot(),
      )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';