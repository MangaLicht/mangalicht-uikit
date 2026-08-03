import React from 'react';
export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}
export type TabVariant = 'block' | 'inner';
export interface TabListProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'variant'> {
    tabs: TabItem[];
    variant?: TabVariant;
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}
export declare const TabList: React.ForwardRefExoticComponent<TabListProps & React.RefAttributes<HTMLDivElement>>;
