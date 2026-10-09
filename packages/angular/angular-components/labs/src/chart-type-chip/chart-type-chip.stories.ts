import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { labsBanner } from '../stories/labs-story';
import { LABS_CHART_TYPE_LABELS, SocLabsChartTypeChip, type LabsChartType } from './chart-type-chip';

const TYPES = Object.keys(LABS_CHART_TYPE_LABELS) as LabsChartType[];

const meta: Meta<SocLabsChartTypeChip> = {
  title: 'Labs (expérimental)/Chart Type Chip',
  component: SocLabsChartTypeChip,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocLabsChartTypeChip] }), labsBanner],
  argTypes: { type: { control: 'select', options: TYPES }, size: { control: 'select', options: [20, 28] } },
  args: { type: 'courbe', size: 28, decorative: false },
  render: (args) => ({
    props: args,
    template: `<soc-labs-chart-type-chip [type]="type" [size]="size" [label]="label" [decorative]="decorative" />`,
  }),
};
export default meta;
type Story = StoryObj<SocLabsChartTypeChip>;

export const Default: Story = {};

/** Les 9 types, en 20 et 28 px. */
export const AllTypes: Story = {
  render: () => ({
    props: { types: TYPES, labels: LABS_CHART_TYPE_LABELS },
    template: `
      <div class="grid grid-cols-[repeat(3,auto)] items-center gap-x-6 gap-y-3 text-sm text-[var(--bridges-color-text-primary)] w-max">
        @for (t of types; track t) {
          <soc-labs-chart-type-chip [type]="t" [size]="20" />
          <soc-labs-chart-type-chip [type]="t" [size]="28" />
          <span>{{ labels[t] }}</span>
        }
      </div>
    `,
  }),
};
