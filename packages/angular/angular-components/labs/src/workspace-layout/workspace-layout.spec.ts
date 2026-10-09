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
});
