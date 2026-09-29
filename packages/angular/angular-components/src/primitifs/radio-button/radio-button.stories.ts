import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocRadioButton } from './radio-button';

const OPTIONS = [
  { id: 'monthly', label: 'Mensuel' },
  { id: 'yearly', label: 'Annuel' },
  { id: 'lifetime', label: 'À vie' },
];

@Component({
  selector: 'story-radio-default',
  standalone: true,
  imports: [SocRadioButton],
  template: `<soc-radio-button [label]="label" [disabled]="disabled" [selected]="selected()" (select)="selected.set(true)" />`,
})
class RadioDefaultDemo {
  label = 'Mensuel';
  disabled = false;
  selected = signal(false);
}

@Component({
  selector: 'story-radio-group',
  standalone: true,
  imports: [SocRadioButton],
  template: `
    <div class="flex flex-col gap-3">
      @for (option of options; track option.id) {
        <soc-radio-button name="billing-period" [label]="option.label" [selected]="selected() === option.id" (select)="selected.set(option.id)" />
      }
    </div>
  `,
})
class RadioGroupDemo {
  options = OPTIONS;
  selected = signal('monthly');
}

const meta: Meta<SocRadioButton> = {
  title: 'Components/Control/Radio Button',
  component: SocRadioButton,
  tags: ['autodocs'],
  args: {
    label: 'Mensuel',
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<soc-radio-button [label]="label" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocRadioButton>;

export const Default: Story = {
  decorators: [moduleMetadata({ imports: [RadioDefaultDemo] })],
  render: () => ({ template: `<story-radio-default />` }),
};

export const Group: Story = {
  decorators: [moduleMetadata({ imports: [RadioGroupDemo] })],
  render: () => ({ template: `<story-radio-group />` }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-3">
        <soc-radio-button [label]="label" [disabled]="true" />
        <soc-radio-button [label]="label" [disabled]="true" [selected]="true" />
      </div>
    `,
  }),
};
