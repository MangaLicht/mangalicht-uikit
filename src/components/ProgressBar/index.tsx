import React, { forwardRef } from 'react'
import styles from './ProgressBar.module.scss'

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
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      min = 0,
      max = 100,
      value,
      showLabel = true,
      label,
      ariaLabel,
      classNames,
      wrapperClassName,
    },
    ref,
  ) => {
    // защита от некорректных данных (max <= min) — не даём проценту уйти в NaN/Infinity
    const safeMax = max > min ? max : min + 1;
    const clampedValue = Math.min(Math.max(value, min), safeMax);
    const percentage = ((clampedValue - min) / (safeMax - min)) * 100;

    return (
      <div className={[styles.wrapper, wrapperClassName].filter(Boolean).join(' ')}>
        <div
          ref={ref}
          className={[styles.track, classNames].filter(Boolean).join(' ')}
          role="progressbar"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={ariaLabel}
        >
          <div className={styles.fill} style={{ width: `${percentage}%` }} />
        </div>

        {showLabel ? <span className={styles.label}>{label ?? value}</span> : null}
      </div>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
