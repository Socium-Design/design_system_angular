import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocProgressBar, SocProgressBarTag, type ProgressBarStatus } from './progress-bar';
import { SocTag } from '../tag/tag';

const STATUSES: ProgressBarStatus[] = ['information', 'success', 'warning', 'error'];

const meta: Meta<SocProgressBar> = {
  title: 'Components/Feedback/Progress Bar',
  component: SocProgressBar,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocProgressBar, SocProgressBarTag, SocTag] })],
  argTypes: {
    status: { control: 'select', options: STATUSES },
    size: { control: 'select', options: ['tiny', 'sm', 'md', 'lg'] },
  },
  args: {
    value: 45,
    status: 'information',
    size: 'md',
  },
  render: (args) => ({
    props: args,
    template: `<soc-progress-bar [value]="value" [status]="status" [size]="size" />`,
  }),
};
export default meta;
type Story = StoryObj<SocProgressBar>;

export const Default: Story = {};

export const WithLabelAndHelperText: Story = {
  args: {
    label: 'Onboarding',
    value: 33,
    status: 'success',
    helpTextLeft: 'Date de début : 02/11/24 — Date de fin : 02/07/26',
    helpTextRight: '4 / 12 étapes',
  },
  render: (args) => ({
    props: args,
    template: `
      <soc-progress-bar [label]="label" [value]="value" [status]="status" [helpTextLeft]="helpTextLeft" [helpTextRight]="helpTextRight">
        <soc-tag socProgressBarTag color="success">Terminé</soc-tag>
      </soc-progress-bar>
    `,
  }),
};

export const Large: Story = {
  args: { size: 'lg', value: 62, status: 'success' },
};

export const Tiny: Story = {
  render: () => ({
    template: `
      <div class="w-64">
        <soc-progress-bar size="tiny" [value]="33" status="information" tinyLabel="4/12" />
      </div>
    `,
  }),
};

export const AllStatuses: Story = {
  render: (args) => ({
    props: { ...args, statuses: STATUSES },
    template: `
      <div class="flex w-80 flex-col gap-4">
        @for (status of statuses; track status) {
          <soc-progress-bar [value]="value" [status]="status" [size]="size" />
        }
      </div>
    `,
  }),
};

export const Indeterminate: Story = {
  args: { indeterminate: true, label: 'Traitement en cours…' },
  render: (args) => ({
    props: args,
    template: `<soc-progress-bar [label]="label" [indeterminate]="true" />`,
  }),
};
