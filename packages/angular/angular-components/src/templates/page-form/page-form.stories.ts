import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LucideCircleAlert } from '@lucide/angular';
import { SocBreadcrumb } from '../../primitifs/breadcrumb/breadcrumb';
import { SocButton } from '../../primitifs/button/button';
import { SocInputText } from '../../primitifs/input-text/input-text';
import { SocMessage, SocMessageContent, SocMessageIcon } from '../../primitifs/message/message';
import { SocStepper } from '../../primitifs/stepper/stepper';
import { SocPageActions, SocPageBreadcrumb, SocPageMessage, SocPageSecondContent, SocPageStepper } from '../page-slots';
import { StoryShell } from '../stories-shared';
import { SocPageForm } from './page-form';

@Component({
  selector: 'story-pageform-example',
  standalone: true,
  imports: [
    ReactiveFormsModule, SocPageForm, SocPageBreadcrumb, SocPageStepper, SocPageMessage, SocPageActions, SocPageSecondContent,
    SocBreadcrumb, SocStepper, SocMessage, SocMessageContent, SocMessageIcon, SocButton, SocInputText, LucideCircleAlert,
  ],
  template: `
    <soc-page-form
      [showBack]="true"
      title="Titre de la page"
      description="Créez des sessions à partir des formations du plan, définissez leurs modalités et organisez les participants selon vos impératifs opérationnels."
      sectionTitle="Titre de la section"
      sectionSubtitle="Sous-titre descriptif de la section"
      secondSectionTitle="Titre de la deuxième section"
      secondSectionSubtitle="Sous-titre descriptif de la deuxième section"
    >
      <soc-breadcrumb socPageBreadcrumb [items]="[{ label: 'Parent' }, { label: 'Page actuelle' }]" />
      <soc-stepper
        socPageStepper
        [items]="[
          { label: 'Informations générales', status: 'completed' },
          { label: 'Choix du formulaire', status: 'current' },
          { label: 'Évaluations additionnelles', status: 'upcoming' }
        ]"
      />
      <soc-message socPageMessage variant="banner" status="info">
        <svg lucideCircleAlert socMessageIcon class="size-full" [strokeWidth]="1.5"></svg>
        <span socMessageContent>Description text</span>
      </soc-message>
      <soc-input-text label="Nom du formulaire" placeholder="Saisir un nom" [formControl]="name" [error]="name.invalid && name.touched" />
      <soc-input-text label="Description" placeholder="Saisir une description" [formControl]="description" />
      <div socPageActions class="contents">
        <button socButton variant="tertiary" size="lg">Button</button>
        <button socButton variant="secondary" size="lg">Button</button>
        <button socButton size="lg">Button</button>
      </div>
      <div socPageSecondContent class="flex h-96 w-full items-center justify-center rounded-md border border-dashed border-[var(--bridges-color-border-tertiary)] text-sm text-[var(--bridges-color-text-secondary)]">
        Content slot
      </div>
    </soc-page-form>
  `,
})
class PageFormExample {
  private readonly fb = new FormBuilder();
  name = this.fb.control('', Validators.required);
  description = this.fb.control('');
  touched = signal(false);
}

const meta: Meta = {
  title: 'Templates/Page Form',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [PageFormExample, StoryShell] })],
};
export default meta;
type Story = StoryObj;

/** PageForm fills its container's full height (`size-full`) — outside Storybook that container is
 * always AppShell's Content Zone. The `h-screen` wrapper stands in for that height. */
export const Default: Story = { render: () => ({ template: `<div class="h-screen"><story-pageform-example /></div>` }) };

export const FullPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => ({ template: `<story-shell><story-pageform-example /></story-shell>` }),
};
