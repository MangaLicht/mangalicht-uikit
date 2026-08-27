import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

interface UseAutosizeTextareaOptions {
  /** Минимальная высота в строках */
  minRows?: number;
  /** Максимальная высота в строках — после неё появляется внутренний скролл. Без ограничения по умолчанию */
  maxRows?: number;
  enabled?: boolean;
}

/**
 * useAutosizeTextarea — растягивает textarea по высоте вслед за контентом,
 * ширина при этом не трогается (её задаёт CSS контейнера) — ровно то
 * поведение, которое нужно для markdown-редактора: текст переносится по
 * словам на новую строку, а не расширяет поле в стороны.
 *
 * Техника: перед измерением высота сбрасывается в 'auto' — иначе
 * browser отдаёт scrollHeight уже "растянутого" на предыдущем рендере
 * элемента, и высота может расти, но никогда не уменьшаться при удалении
 * текста. useLayoutEffect (а не useEffect) — чтобы пересчёт высоты
 * произошёл синхронно до отрисовки кадра и не было видимого "прыжка".
 */
export function useAutosizeTextarea(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  options: UseAutosizeTextareaOptions = {},
) {
  const { minRows = 3, maxRows, enabled = true } = options;

  useIsomorphicLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node || !enabled) return undefined;

    const recalculate = () => {
      node.style.height = 'auto';

      const computed = window.getComputedStyle(node);
      const lineHeight = parseFloat(computed.lineHeight) || 20;
      const paddingY = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
      const borderY = parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);

      const minHeight = lineHeight * minRows + paddingY + borderY;
      const maxHeight = maxRows ? lineHeight * maxRows + paddingY + borderY : Infinity;

      const nextHeight = Math.min(Math.max(node.scrollHeight, minHeight), maxHeight);
      node.style.height = `${nextHeight}px`;
      node.style.overflowY = node.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    recalculate();

    // ширина (а вместе с ней и разбивка текста на строки) может
    // измениться не только из-за печати, но и из-за ресайза окна/колонки
    window.addEventListener('resize', recalculate);
    return () => window.removeEventListener('resize', recalculate);
  }, [value, minRows, maxRows, enabled, textareaRef]);
}
