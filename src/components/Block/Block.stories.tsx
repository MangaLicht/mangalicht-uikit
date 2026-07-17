import React from 'react';
import { Block } from './index';
import { Button } from '../Button';

const meta = {
  title: 'Components/Block',
  component: 'Block',
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
      <Block style='default' title='Test' titleStyle={3}>
        <Button labelText='button' />
      </Block>
    </div>
  ),
}

export const Outlined = {
  render: () => (
    <div style={{display: 'flex', width: '256px', height: '512px'}}>
      <Block style='outlined' title='Test' titleStyle={3}>
        <Button labelText='button' />
      </Block>
    </div>
  ),
}

export const Nested = {
  render: () => (
    <div style={{display: 'flex', width: '256px', height: '512px'}}>
      <Block style='default' title='Test' titleStyle={3}>
        <Block style='outlined'></Block>
      </Block>
    </div>
  ),
}