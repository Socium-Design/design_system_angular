import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocAvatarMenu } from './avatar-menu';

const meta: Meta<SocAvatarMenu> = {
  title: 'Components/Container/Avatar Menu',
  component: SocAvatarMenu,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocAvatarMenu] })],
  args: {
    userName: 'Abdou Ndiaye',
    userEmail: 'abdou.ndiaye@socium.link',
    avatarLabel: 'AN',
    showViewProfile: true,
    showEditAvatar: true,
  },
  render: (args) => ({
    props: args,
    template: `<soc-avatar-menu [userName]="userName" [userEmail]="userEmail" [avatarLabel]="avatarLabel" [showViewProfile]="showViewProfile" [showEditAvatar]="showEditAvatar" />`,
  }),
};
export default meta;
type Story = StoryObj<SocAvatarMenu>;

export const Default: Story = {};

/** Both ghost buttons are opt-in here — React hides them when `onViewProfile`/`onEditAvatar` are omitted. */
export const DisconnectOnly: Story = { args: { showViewProfile: false, showEditAvatar: false } };
