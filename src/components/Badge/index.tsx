import React from 'react'
import styles from './Badge.module.scss'

export type BadgeVariant = 'bronze' | 'silver' | 'gold' | 'platinum' | 'ruby' | 'diamond';

export interface BadgeProps {
  /** Тир значка — определяет цветовую схему (медный/серебряный/золотой/платиновый/рубиновый/алмазный) */
  variant: BadgeVariant;
  /** Значение уровня — если label не задан, показывается автотекст "Уровень {level}" */
  level?: number | string;
  /** Полностью переопределяет содержимое значка вместо автогенерируемого "Уровень N" */
  label?: React.ReactNode;
  /** Анимация переливающегося блика. По умолчанию true */
  shine?: boolean;
  classNames?: string;
}

/**
 * Badge — значок уровня/достижения для профиля с бегущим бликом.
 *
 * Блик — отдельный слой поверх фона (span, не ::after — потому что ::after
 * уже свободен для будущих модификаций самого значка), анимируется через
 * CSS transform, а не через left/background-position — это композитная
 * анимация, не триггерящая layout/paint всего элемента на каждый кадр.
 * Между пробегами блика — долгая пауза (см. keyframes), а не постоянное
 * мельтешение — так значок не отвлекает на себя внимание непрерывно.
 * Анимация уважает prefers-reduced-motion.
 */
export const Badge = ({ variant, level, label, shine = true, classNames }: BadgeProps) => {
  const content = label ?? (level !== undefined ? `Уровень ${level}` : null);

  return (
    <span className={[styles.badge, classNames].filter(Boolean).join(' ')} data-variant={variant}>
      {shine ? <span className={styles.shine} aria-hidden="true" /> : null}
      <span className={styles.content}>{content}</span>
    </span>
  );
};

Badge.displayName = 'Badge';
