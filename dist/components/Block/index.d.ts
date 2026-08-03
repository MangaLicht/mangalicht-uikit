import type { ReactElement, ReactNode } from 'react';
export interface IBlockProps extends IUIKitProps {
    variant: BlockVariant;
    title?: string;
    titleStyle?: TitleStyle;
    titleChildren?: ReactNode | ReactElement;
    width?: number;
    height?: number;
    className?: string;
    children?: ReactNode | ReactElement;
}
export type BlockVariant = 'default' | 'outlined';
export type TitleStyle = 1 | 2 | 3 | 4 | 5 | 6;
export declare const Block: import("react").ForwardRefExoticComponent<IBlockProps & import("react").RefAttributes<HTMLDivElement>>;
