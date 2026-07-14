import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { computePosition, flip, offset, size } from '@floating-ui/dom';

export interface UseAnchoredPositionOptions {
  /** Показывать/скрывать привязанную панель */
  open: boolean;
  /** Отступ от триггера, px */
  offset?: number;
  /** Растянуть панель по ширине триггера */
  matchWidth?: boolean;
}

export interface UseAnchoredPositionResult<T extends HTMLElement> {
  panelRef: React.RefObject<T | null>;
  style: React.CSSProperties;
  recalculate: () => void;
}

/**
 * useAnchoredPosition — привязывает плавающую панель к триггер-элементу.
 * Использует @floating-ui/dom вместо ручного getBoundingClientRect(),
 * потому что ручной расчёт координат ломается, если у любого предка
 * (например, у zoom-обёртки Storybook, или в реальном приложении —
 * у анимационной библиотеки/CSS transform где-то в дереве) есть
 * transform/filter/perspective — тогда position:fixed начинает
 * отсчитываться не от viewport, а от этого предка, и наши координаты
 * "уезжают". Floating UI сам проходит по дереву предков и корректно
 * учитывает такие случаи.
 */
export function useAnchoredPosition<T extends HTMLElement>(
  triggerRef: React.RefObject<HTMLElement | null>,
  { open, offset: gap = 4, matchWidth = true }: UseAnchoredPositionOptions,
): UseAnchoredPositionResult<T> {
  const panelRef = useRef<T | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  const recalculate = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    computePosition(trigger, panel, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [
        offset(gap),
        flip(),
        ...(matchWidth
          ? [
              size({
                apply({ rects }) {
                  panel.style.width = `${rects.reference.width}px`;
                },
              }),
            ]
          : []),
      ],
    }).then(({ x, y }) => {
      try {
        // Debugging: log positions to help diagnose layout shifts in Storybook
        // eslint-disable-next-line no-console
        console.debug('[useAnchoredPosition] recalc', {
          refRect: trigger.getBoundingClientRect(),
          panelBounding: panel.getBoundingClientRect(),
          computed: { x, y },
          innerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        });
      } catch (e) {
        // ignore
      }
      setStyle({
        position: 'fixed',
        left: x,
        top: y,
        visibility: 'visible',
      });
    });
  }, [triggerRef, gap, matchWidth]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    recalculate();
    const rafId = requestAnimationFrame(recalculate);

    window.addEventListener('resize', recalculate);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', recalculate);
    };
  }, [open, recalculate]);

  return { panelRef, style, recalculate };
}