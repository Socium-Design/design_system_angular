import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../testing/helpers';
import { SocSideNavigation } from './side-navigation';
import { LucidePlus } from '@lucide/angular';
import { NAVIGATION_PRESETS, type NavigationProduct, type SideNavActionData } from './navigation-presets';

@Component({
  standalone: true,
  imports: [SocSideNavigation],
  template: `<soc-side-navigation [product]="product()" [actionSection]="actionSection()" [selectedId]="selected()" [collapsed]="collapsed()" (select)="selected.set($event)" (toggleCollapse)="toggles = toggles + 1" />`,
})
class NavHost {
  product = signal<NavigationProduct>('workspace');
  actionSection = signal<{ title: string; items: SideNavActionData[] } | undefined>(undefined);
  selected = signal<string | undefined>(undefined);
  collapsed = signal(false);
  toggles = 0;
}

describe('SideNavigation', () => {
  function setup() {
    const fixture = TestBed.createComponent(NavHost);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the preset sections and items for the product', () => {
    const f = setup();
    expect(qa(f, 'soc-side-nav-section').length).toBeGreaterThan(1);
    expect(q(f, 'soc-side-navigation').textContent).toContain('Workspace');
  });

  it('gives preset icons the React size and stroke tokens (class + strokeWidth inputs)', () => {
    const f = setup();
    const itemIcons = qa<SVGElement>(f, 'soc-side-nav-section button > span svg').filter((s) => !s.parentElement!.className.includes('chevron'));
    expect(itemIcons.length).toBeGreaterThan(3);
    for (const svg of itemIcons.slice(0, 6)) {
      expect(svg.getAttribute('class')).toContain('size-full');
      expect(svg.getAttribute('stroke-width')).toBe('var(--index-navigation-sidenavigation-item-icon-thickness)');
    }
    // No preset has an action section any more: pass one explicitly.
    f.componentInstance.actionSection.set({ title: 'ACTIONS RAPIDES', items: [{ id: 'ajouter', label: 'Ajouter', icon: LucidePlus }] });
    f.detectChanges();
    const actionIcons = qa<SVGElement>(f, 'span.size-3\\.5 svg');
    expect(actionIcons.length).toBeGreaterThan(0);
    expect(actionIcons[0].getAttribute('stroke-width')).toBe('var(--index-navigation-sidenavigation-action-icon-thickness)');
  });

  it('emits select with the item id and marks the selected item', () => {
    const f = setup();
    const item = qa<HTMLButtonElement>(f, 'soc-side-nav-section button').find((b) => b.textContent!.includes('Tableau de bord'))!;
    item.click();
    f.detectChanges();
    expect(f.componentInstance.selected()).toBe('workspace-tableau-de-bord');
    expect(item.className).toContain('border-r-');
  });

  it('collapses to icons only (titles/labels hidden) and emits toggleCollapse', () => {
    const f = setup();
    q<HTMLButtonElement>(f, 'button[aria-label="Replier le menu"]').click();
    expect(f.componentInstance.toggles).toBe(1);
    f.componentInstance.collapsed.set(true);
    f.detectChanges();
    expect(q(f, 'soc-side-navigation').textContent).not.toContain('Tableau de bord');
    expect(qa(f, 'button[aria-label="Déplier le menu"]').length).toBe(1);
  });

  it('perfs preset: the production menu (Configurations, Catalogue, Mon espace), no quick actions', () => {
    const f = setup();
    f.componentInstance.product.set('perfs');
    f.detectChanges();
    const labels = (title: string) => NAVIGATION_PRESETS.perfs.sections.find((s) => s.title === title)!.items.map((i) => i.label);
    expect(labels('MENU PRINCIPAL')).toEqual([
      'Tableau de bord', 'Objectifs', 'Évaluations', 'Compétences', 'Carrières', 'Catalogue', 'Matrice 9-box', 'Employés', 'Configurations', 'Historiques',
    ]);
    expect(labels('MON ESPACE')).toEqual(['Mes objectifs', 'Mes contrats', 'Mes plans']);
    expect(NAVIGATION_PRESETS.perfs.actionSection).toBeUndefined();
    const item = qa<HTMLButtonElement>(f, 'soc-side-nav-section button').find((b) => b.textContent!.includes('Configurations'))!;
    item.click();
    expect(f.componentInstance.selected()).toBe('perfs-configurations');
    expect(q(f, 'soc-side-navigation').textContent).not.toContain('ACTIONS RAPIDES');
  });

  it('workspace preset: exactly the production menu, in order (4 sections)', () => {
    const f = setup();
    const labels = (title: string) => NAVIGATION_PRESETS.workspace.sections.find((s) => s.title === title)!.items.map((i) => i.label);
    expect(labels('MENU PRINCIPAL')).toEqual([
      'Accueil', 'Tableau de bord', 'Rapports RH', 'Entreprises', 'Imports / Exports', 'Pays', 'Historique', 'Template',
    ]);
    expect(labels('GESTION ENTREPRISE')).toEqual([
      'Infos générales', 'Demandes reçues', 'Applications', 'Employés', 'Permissions', 'Postes', 'Structures', 'Organigramme', 'Configurations',
    ]);
    expect(labels('PARAMÈTRES DE PAIE')).toEqual([
      'Paramètres de paie', 'Rubriques de paie', 'Bulletin de paie', "Template d'état de paie", 'Contrôle du cycle de paie',
    ]);
    expect(labels('MON ESPACE')).toEqual(['Profil', 'Mes tâches']);
    expect(NAVIGATION_PRESETS.workspace.sections.map((s) => s.title)).toEqual(['MENU PRINCIPAL', 'GESTION ENTREPRISE', 'PARAMÈTRES DE PAIE', 'MON ESPACE']);
    const item = qa<HTMLButtonElement>(f, 'soc-side-nav-section button').find((b) => b.textContent!.includes('Entreprises'))!;
    item.click();
    expect(f.componentInstance.selected()).toBe('workspace-entreprises');
  });

  it('switching product swaps the whole menu', () => {
    const f = setup();
    const before = q(f, 'soc-side-navigation').textContent;
    f.componentInstance.product.set('payroll');
    f.detectChanges();
    expect(q(f, 'soc-side-navigation').textContent).not.toBe(before);
  });
});
