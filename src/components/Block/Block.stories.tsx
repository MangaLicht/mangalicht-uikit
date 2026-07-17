import React from 'react';
import { Block } from './index';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';

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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <Block style='outlined'>
            <div style={{
              display: 'flex',
              gap: '4px',
            }}>
              <Button labelText='button 1'/>
              <Button labelText='button 2'/>
            </div>
          </Block>
          <Block style='outlined' height={64}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
            }}>
              <Checkbox labelText='checkbox 1' />
              <Checkbox labelText='checkbox 2' />
              <Checkbox style='radio' labelText='radio 1' />
              <Checkbox style='radio' labelText='radio 2' />
            </div>
          </Block>
          <Block style='outlined' height={64}></Block>
        </div>
      </Block>
    </div>
  ),
}