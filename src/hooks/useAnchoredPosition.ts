import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { autoUpdate, computePosition, flip, offset, size, type Placement } from '@floating-ui/dom';

export interface UseAnchoredPositionOptions {
  open: boolean;
  offset?: number;
  matchWidth?: boolean;
  placement?: Placement;
}

export interface UseAnchoredPositionResult<T extends HTMLElement> {
  panelRef: React.RefObject<T | null>;
  style: React.CSSProperties;
  recalculate: () => void;
}

export function useAnchoredPosition<T extends HTMLElement>(
  triggerRef: React.RefObject<HTMLElement | null>,
  { open, offset: gap = 4, matchWidth = true, placement = 'bottom-start' }: UseAnchoredPositionOptions,
): UseAnchoredPositionResult<T> {
  const panelRef = useRef<T | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  const recalculate = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    computePosition(trigger, panel, {
      placement,
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
      // The first calculation can happen in the same frame in which a
      // parent portal/panel has just been opened. Make the position visible
      // only after Floating UI has measured the committed DOM.
      setStyle({
        position: 'fixed',
        left: Math.round(x),
        top: Math.round(y),
        visibility: 'visible',
      });
    });
  }, [triggerRef, gap, matchWidth, placement]);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(current => ({ ...current, visibility: 'hidden' }));
      return undefined;
    }

    let cleanupAutoUpdate: (() => void) | undefined;
    let frame = 0;

    // Wait one frame so that a newly opened parent submenu has its final
    // layout before a child submenu measures its trigger.
    frame = requestAnimationFrame(() => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      recalculate();
      cleanupAutoUpdate = autoUpdate(trigger, panel, recalculate, {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true,
        layoutShift: true,
        animationFrame: true,
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      cleanupAutoUpdate?.();
    };
  }, [open, recalculate, triggerRef]);

  return { panelRef, style, recalculate };
}
