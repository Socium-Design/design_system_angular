import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { labsBanner } from '../stories/labs-story';
import { SocLabsProgressRing } from './progress-ring';

const meta: Meta<SocLabsProgressRing> = {
  title: 'Labs (expérimental)/Progress Ring',
  component: SocLabsProgressRing,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsProgressRing] }), labsBanner],
  argTypes: {
    status: { control: 'select', options: ['information', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: { value: 60, status: 'success', size: 'sm', label: 'Progression', hideValue: false },
};
export default meta;
type Story = StoryObj<SocLabsProgressRing>;

export const Default: Story = {};

/** Colonne « Progression » de Perfs > Objectifs : 0 %, en cours, dépassé (> 100 %). */
export const Values: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-3">
        <soc-labs-progress-ring [value]="0" label="0 %" />
        <soc-labs-progress-ring [value]="26.67" label="26,67 %" />
        <soc-labs-progress-ring [value]="60" label="60 %" />
        <soc-labs-progress-ring [value]="157.37" status="information" label="157,37 %" />
      </div>
    `,
  }),
};
