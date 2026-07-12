import { useCallback, useState } from 'react';

export interface UseMouseTrackingOptions {
  /** Курсор зашёл в область элемента */
  onEnter?: (x: number, y: number) => void;
  /** Курсор движется внутри области элемента */
  onMove?: (x: number, y: number) => void;
  /** Курсор покинул область элемента */
  onLeave?: () => void;
}

export interface UseMouseTrackingResult {
  /** Курсор сейчас находится над элементом */
  isHovering: boolean;
  /** Готовые обработчики — навешиваются на любой DOM-элемент или React-компонент */
  handlers: {
    onMouseEnter: (event: React.MouseEvent) => void;
    onMouseMove: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
  };
}

/**
 * useMouseTracking — универсальное отслеживание координат курсора мыши
 * (в системе координат viewport, event.clientX/clientY) над произвольным
 * элементом. Не знает ничего про тултипы, задержки показа или сглаживание
 * движения — только сообщает "курсор здесь" и "курсор ушёл". Логику
 * поверх этих сырых данных (когда показывать, как интерполировать
 * позицию) добавляет вызывающий код.
 */
export function useMouseTracking({
  onEnter,
  onMove,
  onLeave,
}: UseMouseTrackingOptions = {}): UseMouseTrackingResult {
  const [isHovering, setIsHovering] = useState(false);

  const onMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      setIsHovering(true);
      onEnter?.(event.clientX, event.clientY);
    },
    [onEnter],
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      onMove?.(event.clientX, event.clientY);
    },
    [onMove],
  );

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
    onLeave?.();
  }, [onLeave]);

  return {
    isHovering,
    handlers: { onMouseEnter, onMouseMove, onMouseLeave },
  };
}