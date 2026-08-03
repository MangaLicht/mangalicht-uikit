import React from 'react';
export type ProgressFill = 'yellow' | 'accent';
export interface ProgressBarProps {
    /** Минимальное значение шкалы. По умолчанию 0 */
    min?: number;
    /** Максимальное значение шкалы. По умолчанию 100 */
    max?: number;
    /** Текущее/целевое значение — не обязано укладываться в [min, max], визуально клэмпится */
    value: number;
    /** Показывать подпись со значением справа от полосы. По умолчанию true */
    showLabel?: boolean;
    /** Переопределяет содержимое подписи (по умолчанию — само value) */
    label?: React.ReactNode;
    /** Доступное имя для screen reader — полезно, когда showLabel=false */
    ariaLabel?: string;
    /** Вариации трека прогресс бара */
    fillColor?: ProgressFill;
    /** className на саму полосу-трек */
    classNames?: string;
    /** className на корневой контейнер (трек + подпись) */
    wrapperClassName?: string;
}
/**
 * ProgressBar — горизонтальный индикатор прогресса с закруглёнными краями
 * и подписью значения справа.
 *
 * min/max/value — обычные пропы, читаются заново на каждый рендер и нигде
 * не кешируются в useState/useRef при монтировании — значит шкалу можно
 * свободно менять в рантайме (например, если max приходит с сервера и
 * может обновиться уже после первого рендера).
 */
export declare const ProgressBar: React.ForwardRefExoticComponent<ProgressBarProps & React.RefAttributes<HTMLDivElement>>;
