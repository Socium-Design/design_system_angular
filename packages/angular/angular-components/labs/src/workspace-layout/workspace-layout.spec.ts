import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../../src/testing/helpers';
import {
  SocLabsWorkspaceActions,
  SocLabsWorkspaceBack,
  SocLabsWorkspaceHint,
  SocLabsWorkspaceLayout,
  SocLabsWorkspaceLeft,
  SocLabsWorkspaceRight,
  SocLabsWorkspaceTitle,
} from './workspace-layout';

const SLOTS = [SocLabsWorkspaceLayout, SocLabsWorkspaceBack, SocLabsWorkspaceTitle, SocLabsWorkspaceHint, SocLabsWorkspaceActions, SocLabsWorkspaceLeft, SocLabsWorkspaceRight];

@Component({
  standalone: true,
  imports: SLOTS,
  template: `
    <div style="height: 400px">
      <soc-labs-workspace-layout [leftWidth]="leftWidth()">
        <button socLabsWorkspaceBack class="back">←</button>
        <span socLabsWorkspaceTitle class="title">Tableau de bord RH</span>
        <span socLabsWorkspaceHint class="hint">Brouillon</span>
        <button socLabsWorkspaceActions class="action">Enregistrer</button>
        @if (withLeft()) {
          <div socLabsWorkspaceLeft class="left" style="height: 2000px">Infos</div>
        }
        @if (withRight()) {
          <div socLabsWorkspaceRight class="right">Catalogue</div>
        }
        <p class="center" style="height: 2000px">Composition</p>
      </soc-labs-workspace-layout>
    </div>
  `,
})
class Full {
  leftWidth = signal('220px');
  withLeft = signal(true);
  withRight = signal(true);
}

@Component({
  standalone: true,
  imports: SLOTS,
  template: `<soc-labs-workspace-layout><p class="center">Seul</p></soc-labs-workspace-layout>`,
})
class CenterOnly {}

@Component({
  standalone: true,
  imports: SLOTS,
  template: `
    <div style="height: 400px">
      <soc-labs-workspace-layout [collapsibleBelow]="below()" [(leftCollapsed)]="leftCollapsed" (rightCollapsedChange)="rightChanges.push($event)">
        <div socLabsWorkspaceLeft class="left"><input class="search" /></div>
        <div socLabsWorkspaceRight class="right">Catalogue</div>
        <p class="center">Composition</p>
      </soc-labs-workspace-layout>
    </div>
  `,
})
class Collapsible {
  below = signal<number | null>(1440);
  leftCollapsed = false;
  rightChanges: boolean[] = [];
}

/** Controllable `window.matchMedia`: every `(max-width: Npx)` query follows `viewport`. */
class FakeViewport {
  width = 1280;
  readonly queries: { max: number; matches: boolean; listeners: Set<(e: MediaQueryListEvent) => void> }[] = [];

  install(): void {
    spyOn(window, 'matchMedia').and.callFake((media: string) => {
      const max = parseFloat(/max-width:\s*([\d.]+)px/.exec(media)![1]);
      const entry = { max, matches: this.width <= max, listeners: new Set<(e: MediaQueryListEvent) => void>() };
      this.queries.push(entry);
      return {
        media,
        get matches() { return entry.matches; },
        addEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => entry.listeners.add(l),
        removeEventListener: (_: string, l: (e: MediaQueryListEvent) => void) => entry.listeners.delete(l),
      } as unknown as MediaQueryList;
    });
  }

  resize(width: number): void {
    this.width = width;
    for (const entry of this.queries) {
      const matches = width <= entry.max;
      if (matches === entry.matches) continue;
      entry.matches = matches;
      entry.listeners.forEach((l) => l({ matches } as MediaQueryListEvent));
    }
  }

  get listenerCount(): number {
    return this.queries.reduce((n, e) => n + e.listeners.size, 0);
  }
}

describe('Labs / WorkspaceLayout', () => {
  function setup() {
    const fixture = TestBed.createComponent(Full);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, region: (r: string) => q(fixture, `[data-region=${r}]`) };
  }

  it('projects every slot in its region', () => {
    const { region } = setup();
    const top = region('top-bar');
    for (const sel of ['.back', '.title', '.hint', '.action']) expect(top.querySelector(sel)).withContext(sel).not.toBeNull();
    expect(region('left').querySelector('.left')).not.toBeNull();
    expect(region('right').querySelector('.right')).not.toBeNull();
    expect(region('center').querySelector('.center')).not.toBeNull();
  });

  it('panels are named asides with default widths 220px / 240px, overridable', () => {
    const { fixture, host, region } = setup();
    expect(region('left').tagName).toBe('ASIDE');
    expect(region('left').getAttribute('aria-label')).toBe('Informations');
    expect(region('left').style.width).toBe('220px');
    expect(region('right').style.width).toBe('240px');
    expect(region('center').tagName).toBe('SECTION');
    host.leftWidth.set('300px');
    fixture.detectChanges();
    expect(region('left').style.width).toBe('300px');
  });

  it('panels are optional', () => {
    const { fixture, host } = setup();
    host.withLeft.set(false);
    host.withRight.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-region=left]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-region=right]')).toBeNull();
    expect(q(fixture, '[data-region=center] .center')).toBeTruthy();
  });

  it('without any top-bar slot there is no top bar', () => {
    const fixture = TestBed.createComponent(CenterOnly);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-region=top-bar]')).toBeNull();
    expect(q(fixture, '[data-region=center] .center').textContent).toContain('Seul');
  });

  it('uses kit tokens: grey center, white bordered panels, each column scrolls on its own', () => {
    const { region } = setup();
    expect(region('center').className).toContain('bg-[var(--bridges-color-background-layer-1)]');
    expect(region('left').className).toContain('bg-[var(--bridges-color-surface-neutral-white)]');
    expect(region('left').className).toContain('border-r-[length:var(--bridges-shape-line-hairline)]');
    expect(region('right').className).toContain('border-l-[length:var(--bridges-shape-line-hairline)]');
    for (const r of ['left', 'center', 'right']) expect(region(r).className).withContext(r).toContain('overflow-y-auto');
  });

  describe('collapsible panels', () => {
    let viewport: FakeViewport;
    beforeEach(() => {
      viewport = new FakeViewport();
      viewport.install();
    });

    function setupCollapsible(width: number) {
      viewport.width = width;
      const fixture = TestBed.createComponent(Collapsible);
      fixture.detectChanges();
      fixture.detectChanges();
      const region = (r: string) => q(fixture, `[data-region=${r}]`);
      const toggle = (r: string) => region(r).querySelector<HTMLButtonElement>('[data-toggle] button');
      return { fixture, host: fixture.componentInstance, region, toggle };
    }

    it('collapsibleBelow null: no toggle, panels expanded, no media query', () => {
      const fixture = TestBed.createComponent(Full);
      fixture.detectChanges();
      expect(window.matchMedia).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('[data-toggle]')).toBeNull();
      expect(q(fixture, '[data-region=left]').getAttribute('data-state')).toBe('expanded');
      expect(q(fixture, '[data-region=left] [data-panel-content]').hidden).toBeFalse();
    });

    it('wide viewport: no toggle, panels expanded at their width', () => {
      const { fixture, region } = setupCollapsible(1600);
      expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1439.98px)');
      expect(fixture.nativeElement.querySelector('[data-toggle]')).toBeNull();
      expect(region('left').getAttribute('data-state')).toBe('expanded');
      expect(region('left').style.width).toBe('220px');
    });

    it('narrow viewport: both panels collapse into a rail with an expand button', () => {
      const { host, region, toggle } = setupCollapsible(1280);
      expect(host.leftCollapsed).toBeTrue();
      expect(host.rightChanges).toEqual([true]);
      for (const [r, label] of [['left', 'Informations'], ['right', 'Bibliothèque']]) {
        const aside = region(r);
        const content = aside.querySelector<HTMLElement>('[data-panel-content]')!;
        expect(aside.getAttribute('data-state')).withContext(r).toBe('collapsed');
        expect(aside.style.width).withContext(r).toBe('');
        expect(aside.className).withContext(r).toContain('w-[calc(var(--bridges-size-icon-lg)');
        expect(aside.getAttribute('aria-label')).withContext(r).toBe(label);
        const button = toggle(r)!;
        expect(button.getAttribute('aria-label')).withContext(r).toBe(`Déplier le panneau ${label}`);
        expect(button.getAttribute('aria-expanded')).withContext(r).toBe('false');
        expect(button.getAttribute('aria-controls')).withContext(r).toBe(content.id);
        expect(content.id).withContext(r).toBeTruthy();
        expect(content.hidden).withContext(r).toBeTrue();
        const vertical = aside.querySelector('[aria-hidden=true][class*="writing-mode:vertical-rl"]');
        expect(vertical?.textContent?.trim()).withContext(r).toBe(label);
      }
    });

    it('clicking expand opens the panel, emits the model, and shows a collapse button', () => {
      const { fixture, host, region, toggle } = setupCollapsible(1280);
      toggle('right')!.click();
      fixture.detectChanges();
      expect(host.rightChanges).toEqual([true, false]);
      expect(region('right').getAttribute('data-state')).toBe('expanded');
      expect(region('right').style.width).toBe('240px');
      expect(q(fixture, '[data-region=right] .right').offsetParent).not.toBeNull();
      const button = toggle('right')!;
      expect(button.getAttribute('aria-label')).toBe('Replier le panneau Bibliothèque');
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(region('left').getAttribute('data-state')).withContext('other panel untouched').toBe('collapsed');

      button.click();
      fixture.detectChanges();
      expect(host.rightChanges).toEqual([true, false, true]);
      expect(region('right').getAttribute('data-state')).toBe('collapsed');
    });

    it('two-way binding: the parent can expand a panel', () => {
      const { fixture, host, region } = setupCollapsible(1280);
      host.leftCollapsed = false;
      fixture.detectChanges();
      expect(region('left').getAttribute('data-state')).toBe('expanded');
    });

    it('collapsed content is hidden, not destroyed: its state survives', () => {
      const { fixture, toggle } = setupCollapsible(1280);
      const search = q<HTMLInputElement>(fixture, '[data-region=left] .search');
      toggle('left')!.click();
      fixture.detectChanges();
      search.value = 'effectif';
      toggle('left')!.click();
      fixture.detectChanges();
      expect(search.isConnected).toBeTrue();
      expect(search.closest<HTMLElement>('[data-panel-content]')!.hidden).toBeTrue();
      toggle('left')!.click();
      fixture.detectChanges();
      expect(q<HTMLInputElement>(fixture, '[data-region=left] .search')).toBe(search);
      expect(search.value).toBe('effectif');
    });

    it('follows the viewport: leaving narrow mode expands both panels and removes the toggles', () => {
      const { fixture, host, region } = setupCollapsible(1600);
      viewport.resize(1366);
      fixture.detectChanges();
      expect(region('left').getAttribute('data-state')).toBe('collapsed');
      expect(region('right').getAttribute('data-state')).toBe('collapsed');

      viewport.resize(1920);
      fixture.detectChanges();
      expect(host.leftCollapsed).toBeFalse();
      expect(host.rightChanges).toEqual([true, false]);
      expect(fixture.nativeElement.querySelector('[data-toggle]')).toBeNull();
      expect(region('left').getAttribute('data-state')).toBe('expanded');
      expect(q(fixture, '[data-region=left] [data-panel-content]').hidden).toBeFalse();
    });

    it('panels stay expanded outside narrow mode whatever the models say', () => {
      const { fixture, host, region } = setupCollapsible(1600);
      host.leftCollapsed = true;
      fixture.detectChanges();
      expect(region('left').getAttribute('data-state')).toBe('expanded');
      expect(q(fixture, '[data-region=left] [data-panel-content]').hidden).toBeFalse();
    });

    it('removes its media-query listener on destroy and when collapsibleBelow becomes null', () => {
      const { fixture, host } = setupCollapsible(1280);
      expect(viewport.listenerCount).toBe(1);
      host.below.set(null);
      fixture.detectChanges();
      expect(viewport.listenerCount).toBe(0);
      expect(fixture.nativeElement.querySelector('[data-toggle]')).toBeNull();
      host.below.set(1440);
      fixture.detectChanges();
      expect(viewport.listenerCount).toBe(1);
      fixture.destroy();
      expect(viewport.listenerCount).toBe(0);
    });
  });
});
