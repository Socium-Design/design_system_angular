import type { Meta, StoryObj } from '@storybook/angular';
import { SocSearchBar } from './search-bar';

const meta: Meta<SocSearchBar> = {
  title: 'Components/Input/Search Bar',
  component: SocSearchBar,
  tags: ['autodocs'],
  args: {
    placeholder: 'Rechercher...',
  },
  render: (args) => ({
    props: args,
    template: `<soc-search-bar [placeholder]="placeholder" />`,
  }),
};
export default meta;
type Story = StoryObj<SocSearchBar>;

export const Default: Story = {};

export const Filled: Story = { args: { value: 'Recherche' } };
