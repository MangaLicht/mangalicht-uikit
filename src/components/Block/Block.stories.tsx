import React, { useState } from 'react';
import { Block } from './index';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { Switch } from '../Switch';
import { Select } from '../Select';

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
      <Block variant='default' title='Test' titleStyle={3}>
        <Button labelText='button' />
      </Block>
    </div>
  ),
}

export const Outlined = {
  render: () => (
    <div style={{display: 'flex', width: '256px', height: '512px'}}>
      <Block variant='outlined' title='Test' titleStyle={3}>
        <Button labelText='button' />
      </Block>
    </div>
  ),
}

export const Nested = () => {

  const [checked, setChecked] = useState(false);

  const fruitOptions = [
    { value: 'apple', label: 'Яблоко' },
    { value: 'banana', label: 'Банан' },
    { value: 'cherry', label: 'Вишня', disabled: true },
    { value: 'mango', label: 'Манго' },
    { value: 'kiwi', label: 'Киви' },
  ];

  return (
    <div style={{display: 'flex', width: '256px', height: '512px'}}>
      <Block variant='default' title='Test' titleStyle={3}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <Block variant='outlined'>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              columnGap: '4px',
            }}>
              <Button variant='highlight' labelText='button 1'/>
              <Button labelText='button 2'/>
              <Button variant='bordered' labelText='button 3'/>
              <Button variant='borderedAccent' labelText='button 4'/>
              <Button variant='ghost' labelText='button 5'/>
            </div>
          </Block>
          <Block variant='outlined'>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: '8px',
              gap: '8px',
            }}>
              <Checkbox labelText='checkbox 1' />
              <Checkbox variant='radio' labelText='radio 1' />
              <Switch onChange={setChecked} checked={checked} labelText='switch 1'/>
              <Switch onChange={setChecked} checked={checked} labelText='switch 2' size='small' />
            </div>
          </Block>
          <Block variant='outlined' height={64}>
            <Select options={fruitOptions}/>
          </Block>
        </div>
      </Block>
    </div>
  );
}