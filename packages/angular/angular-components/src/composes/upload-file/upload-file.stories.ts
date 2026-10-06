import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocUploadFile } from './upload-file';

const meta: Meta<SocUploadFile> = {
  title: 'Components/Input/Upload File',
  component: SocUploadFile,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [SocUploadFile] })],
  args: { error: false, warning: false, disabled: false, multiple: false },
  render: (args) => ({
    props: args,
    template: `<soc-upload-file [error]="error" [warning]="warning" [helperText]="helperText" [accept]="accept" [multiple]="multiple" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SocUploadFile>;

export const Default: Story = {};

export const Error: Story = { args: { error: true, helperText: 'File type not supported' } };

export const Warning: Story = { args: { warning: true, helperText: 'File size exceeds limit' } };

export const Disabled: Story = { args: { disabled: true } };
