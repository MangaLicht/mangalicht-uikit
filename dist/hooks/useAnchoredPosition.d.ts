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
export declare function useAnchoredPosition<T extends HTMLElement>(triggerRef: React.RefObject<HTMLElement | null>, { open, offset: gap, matchWidth }: UseAnchoredPositionOptions): UseAnchoredPositionResult<T>;
