import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocChips, SocSelectableChips } from './chips';

@Component({
  selector: 'story-chips-removable',
  standalone: true,
  imports: [SocChips],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (item of items(); track item) {
        <soc-chips [label]="item" [removable]="true" (remove)="remove(item)" />
      }
    </div>
  `,
})
class RemovableDemo {
  items = signal(['React', 'TypeScript', 'Tailwind']);
  remove(item: string) {
    this.items.update((prev) => prev.filter((i) => i !== item));
  }
}

@Component({
  selector: 'story-chips-selectable',
  standalone: true,
  imports: [SocSelectableChips],
  template: `
    <div class="flex gap-2">
      @for (option of options; track option) {
        <soc-selectable-chips [label]="option" [selected]="selected() === option" (click)="selected.set(option)" />
      }
    </div>
  `,
})
class SelectableDemo {
  options = ['Toutes', 'Actives', 'Archivées'];
  selected = signal('Toutes');
}

const meta: Meta<SocChips> = {
  title: 'Components/Selection/Chips',
  component: SocChips,
  tags: ['autodocs'],
  args: {
    label: 'Chip label',
    size: 'sm',
  },
};
export default meta;
type Story = StoryObj<SocChips>;

export const Removable: Story = {
  decorators: [moduleMetadata({ imports: [RemovableDemo] })],
  render: () => ({ template: `<story-chips-removable />` }),
};

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex items-center gap-2">
        <soc-chips [label]="label" size="sm" [removable]="true" />
        <soc-chips [label]="label" size="lg" [removable]="true" />
      </div>
    `,
  }),
};

export const Selectable: Story = {
  decorators: [moduleMetadata({ imports: [SelectableDemo] })],
  render: () => ({ template: `<story-chips-selectable />` }),
};
