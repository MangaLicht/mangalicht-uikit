import React, {
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { getPortalRoot } from '@/shared/utils/portalRoot';
import { useMouseTracking } from '@/hooks/useMouseTracking';
import { useSmoothFollow } from '@/hooks/useSmoothFollow';
import styles from './Tooltip.module.scss';

export type TooltipPosition = 'top' | 'bottom';

export interface TooltipProps {
  /** Содержимое подсказки — текст или произвольный React-узел */
  content: React.ReactNode;
  /** Любой React-элемент UI Kit или обычный React-элемент */
  children: React.ReactElement;
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
   * 0 — подсказка следует мгновенно, без сглаживания.
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
  const tooltipId = `uikit-tooltip-${useId()}`;
  const showTimer = useRef<number | null>(null);

  const applyPosition = useCallback(
    (el: HTMLDivElement, x: number, y: number) => {
      const top = position === 'top' ? y - offset : y + offset;
      el.style.left = `${x}px`;
      el.style.top = `${top}px`;
    },
    [position, offset],
  );

  const { elementRef: tooltipRef, setTarget } = useSmoothFollow<HTMLDivElement>(
    applyPosition,
    { lag: cursorLag, enabled: visible },
  );

  const clearShowTimer = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
  }, []);

  useEffect(() => clearShowTimer, [clearShowTimer]);

  const { handlers: mouseHandlers } = useMouseTracking({
    onEnter: (x, y) => {
      if (disabled) return;

      setTarget(x, y, { teleport: true });
      clearShowTimer();
      showTimer.current = window.setTimeout(() => {
        setVisible(true);
        showTimer.current = null;
      }, showDelay);
    },
    onMove: (x, y) => {
      if (!disabled) setTarget(x, y);
    },
    onLeave: () => {
      clearShowTimer();
      setVisible(false);
    },
  });

  if (!isValidElement(children)) return children;

  /*
   * Не клонируем children и не пытаемся пробросить mouse handlers
   * непосредственно в UI Kit-компонент.
   *
   * Часть компонентов UI Kit рендерит корневой DOM-элемент внутри
   * (например Input -> div -> input, Checkbox -> label -> input,
   * ProgressBar -> wrapper -> track). Поэтому обработчики, добавленные
   * через cloneElement, не попадали на реальный DOM-узел.
   *
   * display: contents сохраняет исходную геометрию компонента и при этом
   * даёт Tooltip единый DOM-родитель, который получает события мыши
   * независимо от внутренней реализации дочернего компонента.
   */
  const describedChild = React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      'aria-describedby': visible && !disabled ? tooltipId : undefined,
    },
  );

  const trigger = (
    <div
      style={{ display: 'contents' }}
      onMouseEnter={mouseHandlers.onMouseEnter}
      onMouseMove={mouseHandlers.onMouseMove}
      onMouseLeave={mouseHandlers.onMouseLeave}
    >
      {describedChild}
    </div>
  );

  return (
    <>
      {trigger}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={tooltipRef}
              id={tooltipId}
              className={[styles.tooltip, classNames].filter(Boolean).join(' ')}
              data-position={position}
              data-visible={visible && !disabled}
              aria-hidden={!visible || disabled}
              role="tooltip"
            >
              {content}
            </div>,
            getPortalRoot(),
          )
        : null}
    </>
  );
};

Tooltip.displayName = 'Tooltip';
