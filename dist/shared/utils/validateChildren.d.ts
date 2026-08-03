import { ReactNode, ComponentType } from 'react';
type AllowedChildType = string | ComponentType<any>;
interface ValidateChildrenOptions {
    children: ReactNode;
    allowedTypes: AllowedChildType[];
    componentName: string;
}
export declare const validateChildren: ({ children, allowedTypes, componentName, }: ValidateChildrenOptions) => ReactNode[];
export {};
