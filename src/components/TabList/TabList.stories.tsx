import React, { useState } from 'react'
import { TabList } from './index'
import { PencilIcon, EyeIcon } from '../../icons/Markdown'
//import { HomeIcon, BookIcon, UsersIcon, SettingsIcon } from '@icons/Navigation';

const meta = {
  title: 'Components/TabList',
  component: TabList,
  argTypes: {
    activeTab: { control: 'text' },
    className: { control: 'text' },
  },
}

export default meta

export const Default = {
  render: () => {
    const [activeTab, setActiveTab] = useState('write')
    const tabs = [
      { id: 'write', label: 'Написать', icon: <PencilIcon /> },
      { id: 'preview', label: 'Превью', icon: <EyeIcon /> },
    ]

    return (
      <div style={{ padding: '20px' }}>
        <TabList tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  },
}

export const WithoutIcons = {
  render: () => {
    const [activeTab, setActiveTab] = useState('home')
    const tabs = [
      { id: 'home', label: 'Главная' },
      { id: 'about', label: 'О нас' },
      { id: 'contact', label: 'Контакты' },
    ]

    return (
      <div style={{ padding: '20px' }}>
        <TabList tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  },
}

export const MultipleTabs = {
  render: () => {
    const [activeTab, setActiveTab] = useState('home')
    const tabs = [
      { id: 'home', label: 'Главная', icon: undefined },
      { id: 'chapters', label: 'Главы (2)', icon: undefined },
      { id: 'characters', label: 'Персонажи (2)', icon: undefined },
      { id: 'settings', label: 'Настройки', icon: undefined },
    ]

    return (
      <div style={{ padding: '20px' }}>
        <TabList tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    )
  },
}

export const WithCustomClass = {
  render: () => {
    const [activeTab, setActiveTab] = useState('first')
    const tabs = [
      { id: 'first', label: 'Первая вкладка' },
      { id: 'second', label: 'Вторая вкладка' },
      { id: 'third', label: 'Третья вкладка' },
    ]

    return (
      <div style={{ padding: '20px' }}>
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className='custom-tablist'
        />
      </div>
    )
  },
}

export const Controlled = () => {
  const [activeTab, setActiveTab] = useState('tab1')

  const tabs = [
    { id: 'tab1', label: 'Вкладка 1', icon: undefined },
    { id: 'tab2', label: 'Вкладка 2', icon: undefined },
    { id: 'tab3', label: 'Вкладка 3', icon: undefined },
  ]

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <TabList tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--uikit-bg-block)',
          borderRadius: '6px',
          fontSize: '14px',
          color: 'var(--uikit-text-main)',
        }}
      >
        Активная вкладка: <strong>{activeTab}</strong>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('tab1')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'tab1' ? 'var(--uikit-accent)' : 'var(--uikit-primary)',
            color: 'var(--uikit-text-main)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Активировать 1
        </button>
        <button
          onClick={() => setActiveTab('tab2')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'tab2' ? 'var(--uikit-accent)' : 'var(--uikit-primary)',
            color: 'var(--uikit-text-main)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Активировать 2
        </button>
        <button
          onClick={() => setActiveTab('tab3')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'tab3' ? 'var(--uikit-accent)' : 'var(--uikit-primary)',
            color: 'var(--uikit-text-main)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Активировать 3
        </button>
      </div>
    </div>
  )
}

export const InBlock = {
  render: () => {
    const [activeTab, setActiveTab] = useState('главная')
    const tabs = [
      { id: 'главная', label: 'Главная' },
      { id: 'главы', label: 'Главы' },
      { id: 'персонажи', label: 'Персонажи' },
    ]

    return (
      <div style={{ display: 'flex', width: '400px', padding: '20px' }}>
        <div
          style={{
            backgroundColor: 'var(--uikit-bg-block)',
            borderRadius: '6px',
            padding: '16px',
            width: '100%',
          }}
        >
          <TabList tabs={tabs} activeTab={activeTab} variant='inner' onTabChange={setActiveTab} />
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'var(--uikit-secondary)',
              borderRadius: '4px',
              fontSize: '14px',
              color: 'var(--uikit-text-main)',
            }}
          >
            Контент для вкладки: {activeTab}
          </div>
        </div>
      </div>
    )
  },
}
