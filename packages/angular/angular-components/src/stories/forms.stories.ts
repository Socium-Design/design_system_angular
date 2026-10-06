import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SocButton } from '../primitifs/button/button';
import { SocCheckbox } from '../primitifs/checkbox/checkbox';
import { SocInputArea } from '../primitifs/input-area/input-area';
import { SocInputNumber } from '../primitifs/input-number/input-number';
import { SocInputText } from '../primitifs/input-text/input-text';
import { SocPassword } from '../primitifs/password/password';
import { SocRadioButton } from '../primitifs/radio-button/radio-button';
import { SocSearchBar } from '../primitifs/search-bar/search-bar';
import { SocSwitch } from '../primitifs/switch/switch';
import { SocMultiSelect } from '../composes/multi-select/multi-select';
import { SocSelect } from '../composes/select/select';
import { SocTableFilterSelect } from '../composes/table-filter-select/table-filter-select';

const COUNTRIES = [
  { value: 'fr', label: 'France' },
  { value: 'sn', label: 'Sénégal' },
  { value: 'ci', label: "Côte d'Ivoire" },
];
const SKILLS = [
  { value: 'angular', label: 'Angular' },
  { value: 'react', label: 'React' },
  { value: 'rxjs', label: 'RxJS' },
];

@Component({
  selector: 'story-reactive-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    SocButton,
    SocInputText,
    SocInputArea,
    SocInputNumber,
    SocPassword,
    SocSearchBar,
    SocCheckbox,
    SocSwitch,
    SocRadioButton,
    SocSelect,
    SocMultiSelect,
    SocTableFilterSelect,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submitted.set(true)" class="flex w-[480px] flex-col gap-4" novalidate>
      <soc-input-text
        label="Nom"
        formControlName="name"
        name="name"
        autocomplete="name"
        [maxlength]="40"
        [inputAttrs]="{ 'data-testid': 'name-input' }"
        required
        [error]="invalid('name')"
        [helperText]="invalid('name') ? 'Ce champ est requis' : undefined"
      />
      <soc-input-text label="Email" formControlName="email" type="email" [error]="invalid('email')" [helperText]="invalid('email') ? 'Email invalide' : undefined" />
      <soc-password label="Mot de passe" formControlName="password" autocomplete="new-password" />
      <soc-input-area label="Bio" formControlName="bio" [rows]="2" />
      <soc-input-number label="Âge" formControlName="age" [min]="18" [max]="99" />
      <soc-search-bar formControlName="query" placeholder="Rechercher..." />
      <soc-select label="Pays" formControlName="country" placeholder="Choisir un pays" [options]="countries" />
      <soc-multi-select label="Compétences" formControlName="skills" placeholder="Choisir" [options]="skills" />
      <div class="w-[160px]"><soc-table-filter-select label="Filtre" formControlName="filter" [options]="countries" /></div>
      <soc-checkbox label="J'accepte les conditions" formControlName="terms" />
      <soc-switch label="Notifications" formControlName="notifications" />
      <div class="flex gap-4">
        <soc-radio-button label="Mensuel" name="plan" value="monthly" formControlName="plan" />
        <soc-radio-button label="Annuel" name="plan" value="yearly" formControlName="plan" />
      </div>
      <div class="flex gap-2">
        <button socButton type="submit">Envoyer</button>
        <button socButton variant="secondary" type="button" (click)="form.reset()">Réinitialiser</button>
        <button socButton variant="secondary" type="button" (click)="fill()">Pré-remplir</button>
        <button socButton variant="secondary" type="button" (click)="toggleDisabled()">{{ form.disabled ? 'Activer' : 'Désactiver' }}</button>
      </div>
      <pre class="rounded bg-[var(--bridges-color-surface-neutral-first)] p-3 text-xs text-[var(--bridges-color-text-primary)]" data-testid="state">{{ form.getRawValue() | json }}</pre>
      <p class="text-xs text-[var(--bridges-color-text-secondary)]" data-testid="status">valid={{ form.valid }} · submitted={{ submitted() }}</p>
    </form>
  `,
})
class ReactiveFormDemo {
  private readonly fb = new FormBuilder();
  protected readonly countries = COUNTRIES;
  protected readonly skills = SKILLS;
  protected readonly submitted = signal(false);
  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    password: [''],
    bio: [''],
    age: this.fb.control<number | null>(30),
    query: [''],
    country: this.fb.control<string | null>(null),
    skills: this.fb.control<string[]>([]),
    filter: this.fb.control<string | null>(null),
    terms: [false, Validators.requiredTrue],
    notifications: [true],
    plan: this.fb.control<string | null>('monthly'),
  });

  protected invalid(name: string): boolean {
    const c = this.form.get(name)!;
    return c.invalid && (c.touched || this.submitted());
  }
  protected fill(): void {
    this.form.patchValue({ name: 'Awa Diop', email: 'awa@socium.link', age: 41, country: 'sn', skills: ['angular', 'rxjs'], terms: true, plan: 'yearly' });
  }
  protected toggleDisabled(): void {
    if (this.form.disabled) this.form.enable();
    else this.form.disable();
  }
}

@Component({
  selector: 'story-ngmodel-form',
  standalone: true,
  imports: [FormsModule, JsonPipe, SocInputText, SocCheckbox, SocSelect],
  template: `
    <div class="flex w-[360px] flex-col gap-4">
      <soc-input-text label="Prénom" [(ngModel)]="model.firstName" name="firstName" />
      <soc-select label="Pays" [(ngModel)]="model.country" name="country" [options]="countries" />
      <soc-checkbox label="Actif" [(ngModel)]="model.active" name="active" />
      <pre class="rounded bg-[var(--bridges-color-surface-neutral-first)] p-3 text-xs" data-testid="state">{{ model | json }}</pre>
    </div>
  `,
})
class NgModelDemo {
  protected readonly countries = COUNTRIES;
  protected model = { firstName: 'Awa', country: 'fr', active: true };
}

const meta: Meta = {
  title: 'Guides/Formulaires',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ReactiveFormDemo, NgModelDemo] })],
  parameters: {
    docs: {
      description: {
        component:
          "Tous les champs de saisie du kit (`soc-input-text`, `soc-input-area`, `soc-input-number`, `soc-password`, `soc-search-bar`, `soc-checkbox`, `soc-switch`, `soc-radio-button`, `soc-select`, `soc-multi-select`, `soc-table-filter-select`) sont des `ControlValueAccessor` : `formControl`, `formControlName` et `ngModel` fonctionnent directement. `[disabled]`/`setDisabledState`, `required` (Validators.required) et l'état *touched* (blur ou fermeture du menu) sont gérés. Les attributs natifs passent par `id`, `name`, `autocomplete`, `readonly`, `maxlength`, `inputClass` et `inputAttrs`. Pour les `radio-button`, donner à chacun sa `value` et le même `formControlName`.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const ReactiveForm: Story = { render: () => ({ template: `<story-reactive-form />` }) };
export const TemplateDriven: Story = { render: () => ({ template: `<story-ngmodel-form />` }) };
