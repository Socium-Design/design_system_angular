import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocAccordion, SocAccordionRightSlot } from './accordion';
import { SocTag } from '../tag/tag';

const meta: Meta<SocAccordion> = {
  title: 'Components/Container/Accordion',
  component: SocAccordion,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocAccordion, SocAccordionRightSlot, SocTag] })],
  args: {
    label: 'Accordion Item',
  },
  render: (args) => ({
    props: args,
    template: `
      <soc-accordion [label]="label" [open]="open">
        <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu de la section.</p>
      </soc-accordion>
    `,
  }),
};
export default meta;
type Story = StoryObj<SocAccordion>;

export const Default: Story = { args: { open: true } };

export const Closed: Story = {};

export const WithRightSlot: Story = {
  args: { open: true },
  render: (args) => ({
    props: args,
    template: `
      <soc-accordion [label]="label" [open]="open">
        <soc-tag socAccordionRightSlot color="success">Actif</soc-tag>
        <p class="text-sm text-[var(--bridges-color-text-primary)]">Contenu de la section.</p>
      </soc-accordion>
    `,
  }),
};

export const Error: Story = { args: { error: true } };

export const MultipleItems: Story = {
  render: () => ({
    template: `
      <div class="flex w-96 flex-col gap-2">
        <soc-accordion label="Informations générales" [open]="true">
          <p class="text-sm text-[var(--bridges-color-text-primary)]">Premier bloc de contenu.</p>
        </soc-accordion>
        <soc-accordion label="Coordonnées">
          <p class="text-sm text-[var(--bridges-color-text-primary)]">Deuxième bloc de contenu.</p>
        </soc-accordion>
        <soc-accordion label="Documents" [warning]="true">
          <p class="text-sm text-[var(--bridges-color-text-primary)]">Troisième bloc de contenu.</p>
        </soc-accordion>
      </div>
    `,
  }),
};
