import React from 'react';
import { BlockCard } from './index';
import { Button } from '../Button';

const meta = {
  title: 'Components/BlockCard',
  component: BlockCard,
  argTypes: {
    style: {
      control: 'select',
      options: ['default', 'outlined'],
    },
    title: {control: 'text'},
    titleStyle: {control: 'inline-radio'}
  },
};
export default meta;

export const Default = {
  render: () => (
    <div style={{display: 'flex', width: '256px', height: '512px'}}>
      <BlockCard style='default' title='Test' titleStyle={3}>
        <Button labelText='button' />
      </BlockCard>
    </div>
  ),
}

export const Outlined = {
  render: () => (
    <div style={{display: 'flex', width: '256px', height: '512px'}}>
      <BlockCard style='outlined' title='Test' titleStyle={3}>
        <Button labelText='button' />
      </BlockCard>
    </div>
  ),
}