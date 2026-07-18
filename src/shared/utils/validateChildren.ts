import React, { Children, ReactNode, ComponentType } from 'react';

// Тип для разрешенных элементов: это может быть строка ('span', 'div') или сам компонент
type AllowedChildType = string | ComponentType<any>;

interface ValidateChildrenOptions {
  children: ReactNode;
  allowedTypes: AllowedChildType[];
  componentName: string;
}

export const validateChildren = ({
  children,
  allowedTypes,
  componentName,
}: ValidateChildrenOptions): ReactNode[] => {
  const validChildren: ReactNode[] = [];

  Children.forEach(children, (child) => {
    // Пропускаем null, undefined или пустые строки, если они валидны для рендера
    if (child === null || child === undefined) return;

    if (!React.isValidElement(child)) {
      console.error(
        `[${componentName} Error]: Ожидался React-элемент, но получен текстовый узел или некорректное значение.`,
        child
      );
      return;
    }

    const elementChild = child as React.ReactElement<{ children?: ReactNode }>;

    if (elementChild.type === React.Fragment) {
      const fragmentChildren = validateChildren({
        children: elementChild.props.children,
        allowedTypes,
        componentName,
      });
      validChildren.push(...(fragmentChildren as ReactNode[]));
      return;
    }

    // Проверяем, есть ли тип текущего ребенка в массиве разрешенных
    const isAllowed = allowedTypes.includes(elementChild.type as AllowedChildType);

    if (isAllowed) {
      validChildren.push(elementChild);
    } else {
      // Пытаемся получить читаемое имя компонента для логирования
      const receivedName =
        typeof elementChild.type === 'string'
          ? elementChild.type
          : (elementChild.type as any).displayName || (elementChild.type as any).name || 'Unknown';

      const allowedNames = allowedTypes
        .map((t) => (typeof t === 'string' ? t : t.displayName || t.name || 'Unknown'))
        .join(', ');

      console.error(
        `[${componentName} Error]: Недопустимый дочерний элемент <${receivedName}>. ` +
        `Компонент принимает только: [${allowedNames}].`
      );
    }
  });

  return validChildren;
};