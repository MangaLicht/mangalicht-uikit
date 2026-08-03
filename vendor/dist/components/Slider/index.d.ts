import React from 'react';
export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue' | 'min' | 'max' | 'step' | 'type'> {
    /** Текущее значение — если передано, компонент становится управляемым */
    value?: number;
    /** Начальное значение для неуправляемого использования (по умолчанию — min) */
    defaultValue?: number;
    /** Колбэк изменения значения */
    onChange?: (value: number, event?: React.ChangeEvent<HTMLInputElement>) => void;
    /** Минимальное значение шкалы. По умолчанию 0 */
    min?: number;
    /** Максимальное значение шкалы. По умолчанию 100 */
    max?: number;
    /** Шаг изменения значения. По умолчанию 1 */
    step?: number;
    /** Показывать подпись со значением справа от ползунка. По умолчанию true */
    showLabel?: boolean;
    /** Переопределяет содержимое подписи (по умолчанию — само value) */
    label?: React.ReactNode;
    /** className на сам input */
    classNames?: string;
    /** className на корневой контейнер (ползунок + подпись) */
    wrapperClassName?: string;
}
/**
 * Slider — построен поверх нативного input[type="range"] (тот же подход,
 * что и в Switch/Checkbox): клавиатурная навигация (стрелки, Home/End,
 * PageUp/PageDown), touch-драг и ARIA-семантика slider приходят из
 * браузера бесплатно — переопределяется только визуал через
 * ::-webkit-slider-thumb/::-moz-range-thumb, а трек и заливка "прогресса"
 * рисуются отдельными div'ами позади input (родной track делается
 * прозрачным). Все три слоя выровнены через CSS grid-stacking — все
 * попадают в одну ячейку грида и накладываются друг на друга.
 *
 * min/max/step/value — обычные пропы, читаются на каждый рендер, поэтому
 * шкалу можно свободно менять в рантайме — как и в ProgressBar.
 */
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLInputElement>>;
