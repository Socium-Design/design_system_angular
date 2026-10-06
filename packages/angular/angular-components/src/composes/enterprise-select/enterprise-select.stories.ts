import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocEnterpriseSelect, type EnterpriseOption } from './enterprise-select';

const OPTIONS: EnterpriseOption[] = [
  { value: 'sn', company: 'Socium Enterprises', subsidiary: 'Sénégal', count: '1/12' },
  { value: 'ci', company: 'Socium Enterprises', subsidiary: "Côte d'Ivoire", count: '2/12' },
  { value: 'fr', company: 'Socium Enterprises', subsidiary: 'France', count: '3/12' },
];

const meta: Meta<SocEnterpriseSelect> = {
  title: 'Components/Selection/Enterprise Select',
  component: SocEnterpriseSelect,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocEnterpriseSelect] })],
  args: { options: OPTIONS },
  render: (args) => ({
    props: args,
    template: `<div class="bg-[var(--index-navigation-headerapp-bg)] p-4"><soc-enterprise-select [options]="options" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SocEnterpriseSelect>;

export const Default: Story = {};
