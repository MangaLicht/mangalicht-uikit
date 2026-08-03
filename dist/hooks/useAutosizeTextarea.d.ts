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
export declare function useAutosizeTextarea(textareaRef: React.RefObject<HTMLTextAreaElement | null>, value: string, options?: UseAutosizeTextareaOptions): void;
export {};
