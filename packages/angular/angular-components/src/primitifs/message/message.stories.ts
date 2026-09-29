import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocMessage, SocMessageContent, type MessageStatus } from './message';

const STATUSES: MessageStatus[] = ['success', 'error', 'warning', 'info'];

const meta: Meta<SocMessage> = {
  title: 'Components/Feedback/Message',
  component: SocMessage,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocMessage, SocMessageContent] })],
  argTypes: {
    status: { control: 'select', options: STATUSES },
    variant: { control: 'select', options: ['banner', 'inline', 'plain'] },
  },
  args: {
    status: 'success',
    variant: 'banner',
    title: 'Title',
  },
};
export default meta;
type Story = StoryObj<SocMessage>;

export const Banner: Story = {
  args: {
    primaryAction: { label: 'Action' },
    secondaryAction: { label: 'Action' },
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-96">
        <soc-message [status]="status" [variant]="variant" [title]="title" [primaryAction]="primaryAction" [secondaryAction]="secondaryAction">
          <span socMessageContent>Description text</span>
        </soc-message>
      </div>
    `,
  }),
};

export const Inline: Story = {
  args: { variant: 'inline' },
  render: (args) => ({
    props: args,
    template: `
      <soc-message [status]="status" variant="inline">
        <span socMessageContent>Description text</span>
      </soc-message>
    `,
  }),
};

export const Plain: Story = {
  args: { variant: 'plain' },
  render: (args) => ({
    props: args,
    template: `
      <soc-message [status]="status" variant="plain">
        <span socMessageContent>Description text</span>
      </soc-message>
    `,
  }),
};

export const AllStatuses: Story = {
  render: (args) => ({
    props: { ...args, statuses: STATUSES },
    template: `
      <div class="flex w-96 flex-col gap-4">
        @for (status of statuses; track status) {
          <soc-message [status]="status" [variant]="variant" [title]="title">
            <span socMessageContent>Description text</span>
          </soc-message>
        }
      </div>
    `,
  }),
};
