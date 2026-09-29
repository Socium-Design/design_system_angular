import type { Meta, StoryObj } from '@storybook/angular';
import { SocOverlay } from './overlay';

const meta: Meta<SocOverlay> = {
  title: 'Components/Container/Overlay',
  component: SocOverlay,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<SocOverlay>;

export const Default: Story = {
  render: () => ({
    template: `
      <div class="h-96 w-full overflow-hidden rounded-md bg-[repeating-linear-gradient(45deg,#e5e7eb,#e5e7eb_10px,#f3f4f6_10px,#f3f4f6_20px)]">
        <soc-overlay />
      </div>
    `,
  }),
};
