import { Component, computed, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocTag } from '@socium-design/angular-components';
import { labsBanner } from '../stories/labs-story';
import { SocLabsChangesBar } from '../changes-bar/changes-bar';
import { SocLabsNavList } from '../nav-list/nav-list';
import { SocLabsTag } from '../tag/tag';
import { SocLabsOptionRow, SocLabsOptionRowTags } from './option-row';

/** Fonctionnalités et options d'une entreprise (prototype SIRH) : la cible des quatre composants. */
@Component({
  selector: 'story-labs-options-entreprise',
  standalone: true,
  imports: [SocLabsOptionRow, SocLabsOptionRowTags, SocLabsTag, SocTag, SocLabsNavList, SocLabsChangesBar],
  template: `
    <div class="flex max-w-[960px] gap-[var(--bridges-position-gap-lg)]">
      <soc-labs-nav-list class="w-[220px]" ariaLabel="Produits" [items]="produits" [(value)]="produit" />
      <div class="flex min-w-0 flex-1 flex-col">
        <div role="list">
          <soc-labs-option-row
            label="Parcours d'intégration (onboarding)"
            description="Active le parcours d'arrivée d'un nouvel employé, avec ses étapes."
            confirmMessage="Option payante : vérifiez qu'elle a été vendue au client."
            [(checked)]="onboarding"
          >
            <soc-tag socLabsOptionRowTags color="orange">Payant</soc-tag>
            <soc-labs-option-row
              label="Étape Documents"
              description="Ajoute une étape de collecte et de signature de documents."
              [(checked)]="documents"
              [disabled]="!onboarding()"
              disabledReason="Activez d'abord « Parcours d'intégration (onboarding) »."
            />
          </soc-labs-option-row>
          <soc-labs-option-row
            label="Organigramme"
            description="Affiche l'organigramme de l'entreprise aux employés."
            [(checked)]="organigramme"
          >
            <soc-labs-tag socLabsOptionRowTags>Standard</soc-labs-tag>
          </soc-labs-option-row>
          <soc-labs-option-row
            label="Lien entre formations et compétences"
            description="Relie chaque formation aux compétences qu'elle développe, avec une description volontairement longue pour montrer la troncature sur une seule ligne."
            [isNew]="true"
          >
            <soc-tag socLabsOptionRowTags color="purple">Customisation client</soc-tag>
          </soc-labs-option-row>
        </div>
        <soc-labs-changes-bar [count]="count()" [saved]="saved()" (save)="saved.set(true)" (cancel)="reset()" />
      </div>
    </div>
  `,
})
class OptionsEntrepriseStory {
  readonly produits = [
    { id: 'tous', label: 'Tous les produits', count: '2 / 4', countLabel: '2 activées sur 4' },
    { id: 'workspace', label: 'Workspace', count: '2 / 4', countLabel: '2 activées sur 4', icon: 'workspace' },
    { id: 'payroll', label: 'Payroll', count: '0 / 1', countLabel: '0 activée sur 1', icon: 'payroll' },
  ];
  readonly produit = signal('tous');
  readonly onboarding = signal(false);
  readonly documents = signal(false);
  readonly organigramme = signal(true);
  readonly saved = signal(false);
  readonly count = computed(() => Number(this.onboarding()) + Number(this.documents()) + Number(!this.organigramme()));

  reset(): void {
    this.onboarding.set(false);
    this.documents.set(false);
    this.organigramme.set(true);
  }
}

const meta: Meta<SocLabsOptionRow> = {
  title: 'Labs (expérimental)/OptionRow',
  component: SocLabsOptionRow,
  decorators: [moduleMetadata({ imports: [OptionsEntrepriseStory] }), labsBanner],
};
export default meta;

type Story = StoryObj<SocLabsOptionRow>;

/** Ligne d'option, sous-option, confirmation d'une option payante, navigation par produit, barre de modifications. */
export const OptionsEntreprise: Story = {
  render: () => ({ template: `<story-labs-options-entreprise />` }),
};
