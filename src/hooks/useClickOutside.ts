import { useEffect } from 'react';

/**
 * useClickOutside — универсальное закрытие/реакция на клик вне набора
 * элементов (например, триггер + всплывающая панель). Не знает ничего
 * про Select, Dropdown или конкретную верстку — просто сообщает "клик
 * произошёл за пределами всех переданных refs".
 *
 * Обратите внимание: массив refs — зависимость эффекта. Если передавать
 * его инлайн-литералом на каждый рендер, эффект будет пересоздаваться
 * чаще необходимого (сам listener от этого не ломается, но чуть менее
 * оптимально) — в идеале мемоизируйте массив рефов на стороне вызывающего
 * компонента через useMemo/useRef.
 */
export function useClickOutside(
  refs: Array<React.RefObject<HTMLElement | null>>,
  onOutside: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const isInside = refs.some((ref) => ref.current?.contains(target));
      if (!isInside) onOutside();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [refs, onOutside, enabled]);
}