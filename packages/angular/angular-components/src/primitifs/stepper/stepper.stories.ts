import type { Meta, StoryObj } from '@storybook/angular';
import { SocStepper } from './stepper';

const meta: Meta<SocStepper> = {
  title: 'Components/Navigation/Stepper',
  component: SocStepper,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Informations générales', status: 'completed' },
      { label: 'Choix du formulaire', status: 'current' },
      { label: 'Évaluations additionnelles', status: 'upcoming' },
    ],
  },
  render: (args) => ({
    props: args,
    template: `<soc-stepper [items]="items" [orientation]="orientation" />`,
  }),
};
export default meta;
type Story = StoryObj<SocStepper>;

export const Horizontal: Story = {};

export const Vertical: Story = { args: { orientation: 'vertical' } };

export const AllUpcoming: Story = {
  args: {
    items: [
      { label: 'Étape 1', status: 'upcoming' },
      { label: 'Étape 2', status: 'upcoming' },
      { label: 'Étape 3', status: 'upcoming' },
    ],
  },
};
