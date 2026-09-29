import type { Meta, StoryObj } from '@storybook/angular';
import { SocDocumentLine } from './document-line';

const meta: Meta<SocDocumentLine> = {
  title: 'Components/Data/Document Line',
  component: SocDocumentLine,
  tags: ['autodocs'],
  args: {
    title: 'Titre du document',
    date: 'Importé le 20/03/2025',
    fileSize: '272 Ko',
  },
  render: (args) => ({
    props: args,
    template: `<soc-document-line [title]="title" [date]="date" [fileSize]="fileSize" />`,
  }),
};
export default meta;
type Story = StoryObj<SocDocumentLine>;

export const Default: Story = {};

export const List: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex w-80 flex-col gap-4">
        <soc-document-line [title]="title" [date]="date" [fileSize]="fileSize" />
        <soc-document-line title="Contrat de travail.pdf" date="Importé le 12/01/2025" fileSize="1.1 Mo" />
        <soc-document-line title="RIB.pdf" date="Importé le 03/06/2024" fileSize="98 Ko" />
      </div>
    `,
  }),
};
