import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocProfileLine } from './profile-line';

const meta: Meta<SocProfileLine> = {
  title: 'Components/Data/Profile Line',
  component: SocProfileLine,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocProfileLine] })],
  args: {
    avatarLabel: 'DM',
    avatarColor: 'blue',
    name: 'Nom Prénom',
    id: '#123456789',
    role: 'Poste',
    department: 'Département',
    email: 'email@example.com',
    company: 'Entreprise',
  },
  render: (args) => ({
    props: args,
    template: `<soc-profile-line [avatarLabel]="avatarLabel" [avatarColor]="avatarColor" [name]="name" [id]="id" [role]="role" [department]="department" [email]="email" [company]="company" />`,
  }),
};
export default meta;
type Story = StoryObj<SocProfileLine>;

export const Default: Story = {};

export const PartialMeta: Story = {
  args: { avatarLabel: 'SM', avatarColor: 'green', role: 'Éditeur', id: undefined, department: undefined, email: undefined, company: undefined },
};

export const List: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex flex-col gap-4">
        <soc-profile-line [avatarLabel]="avatarLabel" [avatarColor]="avatarColor" [name]="name" [id]="id" [role]="role" [department]="department" [email]="email" [company]="company" />
        <soc-profile-line avatarLabel="LB" avatarColor="purple" name="Lucas Bernard" role="Lecteur" company="Entreprise" />
        <soc-profile-line avatarLabel="MP" avatarColor="orange" name="Marie Petit" id="#987654321" />
      </div>
    `,
  }),
};
