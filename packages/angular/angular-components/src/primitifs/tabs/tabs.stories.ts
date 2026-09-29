import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCalendar } from '@lucide/angular';
import { SocTabs, type TabItem } from './tabs';

const ITEMS: TabItem[] = [
  { id: 'formations', label: 'Formations' },
  { id: 'plan', label: 'Plan de formation' },
  { id: 'sessions', label: 'Sessions de formation' },
];

@Component({
  selector: 'story-tabs-underline',
  standalone: true,
  imports: [SocTabs],
  template: `<soc-tabs [items]="items" [value]="value()" (change)="value.set($event)" variant="underline" />`,
})
class UnderlineDemo {
  items = ITEMS;
  value = signal('formations');
}

@Component({
  selector: 'story-tabs-pill',
  standalone: true,
  imports: [SocTabs],
  template: `<soc-tabs [items]="items" [value]="value()" (change)="value.set($event)" variant="pill" />`,
})
class PillDemo {
  items = ITEMS;
  value = signal('formations');
}

@Component({
  selector: 'story-tabs-icons',
  standalone: true,
  imports: [SocTabs, LucideCalendar],
  template: `
    <ng-template #calendarIcon>
      <svg lucideCalendar class="size-full" [strokeWidth]="calendarThickness"></svg>
    </ng-template>
    <soc-tabs [items]="items()" [value]="value()" (change)="value.set($event)" variant="underline" />
  `,
})
class WithIconsDemo {
  value = signal('formations');
  calendarThickness = 'var(--index-navigation-tab-icon-thickness)';
  private readonly calendarIconTpl = viewChild.required<TemplateRef<void>>('calendarIcon');
  items = computed<TabItem[]>(() => ITEMS.map((item) => ({ ...item, icon: this.calendarIconTpl() })));
}

@Component({
  selector: 'story-tabs-disabled',
  standalone: true,
  imports: [SocTabs],
  template: `<soc-tabs [items]="items" [value]="value()" (change)="value.set($event)" />`,
})
class WithDisabledDemo {
  items: TabItem[] = ITEMS.map((item, i) => (i === 1 ? { ...item, disabled: true } : item));
  value = signal('formations');
}

const meta: Meta<SocTabs> = {
  title: 'Components/Navigation/Tabs',
  component: SocTabs,
  tags: ['autodocs'],
  args: {
    items: ITEMS,
    value: ITEMS[0].id,
  },
};
export default meta;
type Story = StoryObj<SocTabs>;

export const Underline: Story = {
  decorators: [moduleMetadata({ imports: [UnderlineDemo] })],
  render: () => ({ template: `<story-tabs-underline />` }),
};

export const Pill: Story = {
  decorators: [moduleMetadata({ imports: [PillDemo] })],
  render: () => ({ template: `<story-tabs-pill />` }),
};

export const WithIcons: Story = {
  decorators: [moduleMetadata({ imports: [WithIconsDemo] })],
  render: () => ({ template: `<story-tabs-icons />` }),
};

export const WithDisabled: Story = {
  decorators: [moduleMetadata({ imports: [WithDisabledDemo] })],
  render: () => ({ template: `<story-tabs-disabled />` }),
};
