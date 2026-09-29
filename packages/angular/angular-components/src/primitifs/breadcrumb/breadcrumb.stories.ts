import { Component, computed, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocBreadcrumb } from './breadcrumb';

const meta: Meta<SocBreadcrumb> = {
  title: 'Components/Navigation/Breadcrumb',
  component: SocBreadcrumb,
  tags: ['autodocs'],
  args: {
    items: [{ label: 'Parent' }, { label: 'Current page' }],
  },
  render: (args) => ({
    props: args,
    template: `<soc-breadcrumb [items]="items" />`,
  }),
};
export default meta;
type Story = StoryObj<SocBreadcrumb>;

export const Default: Story = {};

export const Truncated: Story = {
  args: {
    items: [{ label: 'Category' }, { label: 'Subcategory' }, { label: 'Parent' }, { label: 'Current page' }],
    truncated: true,
  },
  render: (args) => ({
    props: args,
    template: `<soc-breadcrumb [items]="items" [truncated]="truncated" />`,
  }),
};

export const SingleLevel: Story = {
  args: { items: [{ label: 'Current page' }] },
};

const TRAIL = ['Employés', 'Jean Dupont', 'Historique'];

@Component({
  selector: 'story-breadcrumb-clickable-trail',
  standalone: true,
  imports: [SocBreadcrumb],
  template: `
    <div class="flex flex-col gap-3">
      <soc-breadcrumb [items]="items()" />
      <p class="text-sm text-[var(--bridges-color-text-secondary)]">Niveau actuel : {{ visible()[visible().length - 1] }}</p>
    </div>
  `,
})
class ClickableTrailDemo {
  depth = signal(TRAIL.length);
  visible = computed(() => TRAIL.slice(0, this.depth()));
  items = computed(() =>
    this.visible().map((label, index) => ({
      label,
      onClick: index < this.visible().length - 1 ? () => this.depth.set(index + 1) : undefined,
    })),
  );
}

/**
 * Every item before the last one is a real clickable button (`onClick`) — only the last (current
 * page) is a static, non-interactive label. Click "Employés" or "Jean Dupont" to navigate back;
 * the trail shortens to that level.
 */
export const ClickableTrail: Story = {
  decorators: [moduleMetadata({ imports: [ClickableTrailDemo] })],
  render: () => ({ template: `<story-breadcrumb-clickable-trail />` }),
};
