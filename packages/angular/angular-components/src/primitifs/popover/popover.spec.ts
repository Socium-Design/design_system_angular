import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bodyPortals, pointerDownOutside, pressEscape, q, visiblePanels } from '../../testing/helpers';
import { SocPopover, SocPopoverTrigger } from './popover';

@Component({
  standalone: true,
  imports: [SocPopover, SocPopoverTrigger],
  template: `
    @if (alive()) {
      <soc-popover [(open)]="open" panelClass="extra-panel-class" [matchTriggerWidth]="true">
        <button socPopoverTrigger class="trigger">Ouvrir</button>
        <p class="content">Contenu</p>
      </soc-popover>
    }
  `,
})
class PopoverHost {
  open = signal(false);
  alive = signal(true);
}

describe('Popover', () => {
  function setup() {
    const fixture = TestBed.createComponent(PopoverHost);
    fixture.detectChanges();
    return fixture;
  }

  it('is a layout-transparent fragment (host is display: contents)', () => {
    expect(q(setup(), 'soc-popover').className).toContain('contents');
  });

  it('keeps its panel in <body> (portal), hidden until opened', () => {
    const fixture = setup();
    expect(q(document.body, '.content').parentElement!.parentElement).toBe(document.body);
    expect(visiblePanels().length).toBe(0);
    q(fixture, '.trigger').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBeTrue();
    expect(visiblePanels().length).toBe(1);
  });

  it('applies panelClass to the portaled panel', () => {
    const fixture = setup();
    expect(q(document.body, '.content').parentElement!.className).toContain('extra-panel-class');
  });

  it('closes on Escape and on a pointer-down outside, but not on one inside', () => {
    const fixture = setup();
    q(fixture, '.trigger').click();
    fixture.detectChanges();
    q(document.body, '.content').dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(fixture.componentInstance.open()).toBeTrue();
    pointerDownOutside();
    expect(fixture.componentInstance.open()).toBeFalse();
    fixture.detectChanges(); // let the two-way binding push `false` back down before re-opening

    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    pressEscape();
    expect(fixture.componentInstance.open()).toBeFalse();
  });

  it('removes its panel from <body> when destroyed', () => {
    const fixture = setup();
    const before = document.body.querySelectorAll('body > [role=dialog]').length;
    fixture.componentInstance.alive.set(false);
    fixture.detectChanges();
    expect(document.body.querySelectorAll('body > [role=dialog]').length).toBe(before - 1);
  });
});
