import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocAvatar } from '../../primitifs/avatar/avatar';
import { SocAvatarMenu } from '../avatar-menu/avatar-menu';
import { SocEnterpriseSelect, type EnterpriseOption } from '../enterprise-select/enterprise-select';
import { SocLanguageSelect } from '../language-select/language-select';
import { SocHeaderApp, SocHeaderAppAvatar, SocHeaderAppAvatarMenu, SocHeaderAppLanguageSelect, SocHeaderAppLeft } from './header-app';

const ENTERPRISES: EnterpriseOption[] = [{ value: 'sn', company: 'Socium Enterprises', subsidiary: 'Sénégal', count: '1/12' }];

const meta: Meta<SocHeaderApp> = {
  title: 'Components/Navigation/Header App',
  component: SocHeaderApp,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [
        SocHeaderApp,
        SocHeaderAppLeft,
        SocHeaderAppAvatar,
        SocHeaderAppAvatarMenu,
        SocHeaderAppLanguageSelect,
        SocEnterpriseSelect,
        SocAvatar,
        SocAvatarMenu,
        SocLanguageSelect,
      ],
    }),
  ],
};
export default meta;
type Story = StoryObj<SocHeaderApp>;

export const Default: Story = {
  render: () => ({
    props: { enterprises: ENTERPRISES },
    template: `
      <soc-header-app userName="Absatou Diallo">
        <soc-enterprise-select socHeaderAppLeft [options]="enterprises" />
        <soc-avatar socHeaderAppAvatar label="DM" mode="solid" size="md" />
      </soc-header-app>
    `,
  }),
};

/** Clicking the AvatarZone opens `soc-avatar-menu`, and the language control next to the
 * notification icon opens its own menu. */
export const WithAvatarMenuAndLanguage: Story = {
  render: () => ({
    props: {
      enterprises: ENTERPRISES,
      languages: [
        { value: 'en', label: 'EN' },
        { value: 'fr', label: 'FR' },
      ],
    },
    template: `
      <soc-header-app userName="Absatou Diallo">
        <soc-enterprise-select socHeaderAppLeft [options]="enterprises" />
        <soc-language-select socHeaderAppLanguageSelect [options]="languages" defaultValue="fr" />
        <soc-avatar socHeaderAppAvatar label="DM" mode="solid" size="md" />
        <soc-avatar-menu socHeaderAppAvatarMenu userName="Absatou Diallo" userEmail="absatou.diallo@email.com" avatarLabel="AD" [showViewProfile]="true" [showEditAvatar]="true" />
      </soc-header-app>
    `,
  }),
};
