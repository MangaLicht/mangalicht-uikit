import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react'
import { useAnimationTrigger } from '@hooks/useAnimationTrigger'
import { Button } from '../Button'
import styles from './TabList.module.scss'

export interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
}

export type TabVariant = 'block' | 'inner'

export interface TabListProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'variant'
> {
  tabs: TabItem[]
  variant?: TabVariant
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ tabs, variant = 'block', activeTab, onTabChange, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

    const animate = useAnimationTrigger(activeTab, 500)

    const updateIndicator = useCallback(() => {
      if (!containerRef.current) return
      const activeButton = containerRef.current.querySelector<HTMLElement>(
        `[data-tab-id="${activeTab}"]`,
      )
      if (activeButton) {
        setIndicatorStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        })
      }
    }, [activeTab])

    useEffect(() => {
      updateIndicator()
      window.addEventListener('resize', updateIndicator)
      return () => window.removeEventListener('resize', updateIndicator)
    }, [updateIndicator])

    return (
      <div ref={ref} className={[styles.tabList, className].filter(Boolean).join(' ')}>
        <div className={styles.tabsContainer} ref={containerRef} data-variant={variant}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant='transparent'
              data-tab-id={tab.id}
              data-active={tab.id === activeTab}
              onClick={() => onTabChange(tab.id)}
              animation='none'
              labelText={tab.label}
              iconStart={tab.icon}
              classNames={tab.id === activeTab ? styles.activeTab : ''}
            />
          ))}
          <div
            className={styles.indicator}
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
            data-anim={animate}
          />
        </div>
      </div>
    )
  },
)

TabList.displayName = 'TabList'
