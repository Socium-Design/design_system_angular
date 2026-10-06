import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocLanguageSelect } from './language-select';

const meta: Meta<SocLanguageSelect> = {
  title: 'Components/Selection/Language Select',
  component: SocLanguageSelect,
  tags: ['autodocs'],
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [moduleMetadata({ imports: [SocLanguageSelect] })],
  render: (args) => ({
    props: args,
    template: `<div class="bg-[#182438] p-4"><soc-language-select [options]="options" [defaultValue]="defaultValue" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SocLanguageSelect>;

export const Default: Story = {
  args: {
    options: [
      { value: 'en', label: 'EN' },
      { value: 'fr', label: 'FR' },
    ],
    defaultValue: 'fr',
  },
};

/** The trigger sizes to the widest option among all of them, not just the selected one — so
 * picking "English" after "Français" (or vice versa) never truncates, and never shifts the
 * trigger's width either. */
export const LongLabels: Story = {
  args: {
    options: [
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'Français' },
    ],
    defaultValue: 'fr',
  },
};
