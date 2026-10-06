import { Component, input } from '@angular/core';
import { SocAvatar } from '../primitifs/avatar/avatar';
import { SocEnterpriseSelect, type EnterpriseOption } from '../composes/enterprise-select/enterprise-select';
import type { DataTableCellContext, DataTableColumn } from '../composes/data-table/data-table';
import type { TemplateRef } from '@angular/core';
import { SocAppShell, SocAppShellHeaderAvatar, SocAppShellHeaderLeft } from './app-shell/app-shell';

/** Shared fixtures for the template stories (not part of the public API). */
export interface Person {
  id: string;
  name: string;
  firstName: string;
  email: string;
  role: string;
  status: 'Actif' | 'Inactif';
}

export const PERSONS: Person[] = [
  { id: '1', name: 'Dupont', firstName: 'Jean-Pierre', email: 'jean-pierre@email.com', role: 'Admin', status: 'Actif' },
  { id: '2', name: 'Martin', firstName: 'Sophie', email: 'sophie.martin@email.com', role: 'Éditeur', status: 'Actif' },
  { id: '3', name: 'Bernard', firstName: 'Lucas', email: 'lucas.b@email.com', role: 'Lecteur', status: 'Inactif' },
];

export const personRowKey = (row: Person) => row.id;

export function personColumns(statusCell: TemplateRef<DataTableCellContext<Person>>): DataTableColumn<Person>[] {
  return [
    { key: 'name', header: 'Nom', render: (row) => row.name },
    { key: 'firstName', header: 'Prénom', render: (row) => row.firstName },
    { key: 'email', header: 'Email', render: (row) => row.email },
    { key: 'role', header: 'Rôle', render: (row) => row.role },
    { key: 'status', header: 'Statut', render: statusCell },
  ];
}

export const ENTERPRISES: EnterpriseOption[] = [{ value: 'sn', company: 'Socium Enterprises', subsidiary: 'Sénégal', count: '1/12' }];

/** `AppShell` the way every "FullPage" story uses it: the standard header (enterprise select + avatar)
 * around a projected page. */
@Component({
  selector: 'story-shell',
  standalone: true,
  imports: [SocAppShell, SocAppShellHeaderLeft, SocAppShellHeaderAvatar, SocEnterpriseSelect, SocAvatar],
  template: `
    <soc-app-shell product="workspace" [navSelectedId]="navSelectedId()" headerUserName="Absatou Diallo">
      <soc-enterprise-select socAppShellHeaderLeft [options]="enterprises" />
      <soc-avatar socAppShellHeaderAvatar label="DM" mode="solid" size="md" />
      <ng-content />
    </soc-app-shell>
  `,
})
export class StoryShell {
  readonly navSelectedId = input('workspace-tableau-de-bord');
  protected readonly enterprises = ENTERPRISES;
}
