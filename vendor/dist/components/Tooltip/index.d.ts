import React from 'react';
export type TooltipPosition = 'top' | 'bottom';
export interface TooltipProps {
    /** Содержимое подсказки — текст или произвольный React-узел */
    content: React.ReactNode;
    /** Элемент, при наведении на который появляется подсказка */
    children: React.ReactElement<{
        onMouseEnter?: React.MouseEventHandler<HTMLElement>;
        onMouseMove?: React.MouseEventHandler<HTMLElement>;
        onMouseLeave?: React.MouseEventHandler<HTMLElement>;
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
export declare const Tooltip: {
    ({ content, children, position, disabled, classNames, offset, showDelay, cursorLag, }: TooltipProps): React.JSX.Element;
    displayName: string;
};
