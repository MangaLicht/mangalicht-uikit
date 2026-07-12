import { useCallback, useEffect, useRef } from 'react';

export interface UseSmoothFollowOptions {
  /**
   * Время "погони" за целью, мс. 0 — мгновенно (без сглаживания).
   * Чем больше значение, тем заметнее инерционное отставание.
   */
  lag?: number;
  /** Остановить RAF-цикл (например, пока элемент не виден) — экономит CPU/батарею */
  enabled?: boolean;
}

export interface UseSmoothFollowResult<T extends HTMLElement> {
  /** Подключите к элементу, позицию которого нужно анимировать */
  elementRef: React.RefObject<T | null>;
  /**
   * Задать новую целевую точку. teleport=true — мгновенно "телепортировать"
   * текущую позицию к цели без сглаживания (удобно для первого появления).
   */
  setTarget: (x: number, y: number, opts?: { teleport?: boolean }) => void;
}

/**
 * useSmoothFollow — универсальный хук плавного следования DOM-элемента
 * за произвольной целевой точкой (курсор мыши, палец на тач-устройстве,
 * позиция другого элемента и т.д.). Не знает ничего о тултипах, drag&drop
 * или конкретной верстке — только интерполирует (x, y) через RAF и отдаёт
 * результат в applyPosition, где вызывающий код сам решает, как применить
 * координаты к стилям (left/top, transform, что угодно).
 *
 * Использует requestAnimationFrame + экспоненциальное сглаживание с учётом
 * реальной дельты времени кадра — скорость "погони" не зависит от частоты
 * обновления экрана (60Hz/120Hz) и не зависит от того, как часто вызывается
 * setTarget (в отличие от CSS transition, который дёргается при каждом
 * новом vызове до завершения предыдущего перехода).
 */
export function useSmoothFollow<T extends HTMLElement>(
  applyPosition: (element: T, x: number, y: number) => void,
  { lag = 0, enabled = true }: UseSmoothFollowOptions = {},
): UseSmoothFollowResult<T> {
  const elementRef = useRef<T | null>(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);

  // applyPosition может пересоздаваться на каждый рендер вызывающего кода —
  // держим актуальную ссылку в ref, чтобы не пересоздавать RAF-цикл лишний раз
  const applyPositionRef = useRef(applyPosition);
  useEffect(() => {
    applyPositionRef.current = applyPosition;
  }, [applyPosition]);

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = (time: number) => {
      if (lastFrameTime.current === null) lastFrameTime.current = time;
      const dt = time - lastFrameTime.current;
      lastFrameTime.current = time;

      if (lag <= 0) {
        currentPos.current = { ...targetPos.current };
      } else {
        const factor = 1 - Math.exp(-dt / lag);
        currentPos.current.x +=
          (targetPos.current.x - currentPos.current.x) * factor;
        currentPos.current.y +=
          (targetPos.current.y - currentPos.current.y) * factor;
      }

      if (elementRef.current) {
        applyPositionRef.current(
          elementRef.current,
          currentPos.current.x,
          currentPos.current.y,
        );
      }
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      lastFrameTime.current = null;
    };
  }, [lag, enabled]);

  const setTarget = useCallback<UseSmoothFollowResult<T>['setTarget']>(
    (x, y, opts) => {
      targetPos.current = { x, y };
      if (opts?.teleport) {
        currentPos.current = { x, y };
        if (elementRef.current) {
          applyPositionRef.current(elementRef.current, x, y);
        }
      }
    },
    [],
  );

  return { elementRef, setTarget };
}