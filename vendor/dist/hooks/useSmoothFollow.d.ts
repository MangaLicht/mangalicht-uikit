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
    setTarget: (x: number, y: number, opts?: {
        teleport?: boolean;
    }) => void;
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
export declare function useSmoothFollow<T extends HTMLElement>(applyPosition: (element: T, x: number, y: number) => void, { lag, enabled }?: UseSmoothFollowOptions): UseSmoothFollowResult<T>;
