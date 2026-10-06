import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../testing/helpers';
import { SocTooltip, SocTooltipLabel, type TooltipVariant } from '../tooltip/tooltip';
import { SocMessage, SocMessageContent, SocMessageIcon, type MessageVariant } from './message';

// Regression: the same `<ng-content select>` used in several @if branches silently dropped content
// in all but one of them. Every variant must render the projected icon and content.
@Component({
  standalone: true,
  imports: [SocMessage, SocMessageIcon, SocMessageContent],
  template: `
    <soc-message [variant]="variant()" status="success">
      <svg socMessageIcon class="proj-icon"></svg>
      <span socMessageContent class="proj-content">Texte</span>
    </soc-message>
  `,
})
class MessageHost {
  variant = input<MessageVariant>('banner');
}

@Component({
  standalone: true,
  imports: [SocTooltip, SocTooltipLabel],
  template: `
    <soc-tooltip [variant]="variant()" title="Titre">
      <button class="trigger">?</button>
      <span socTooltipLabel class="proj-label">Aide</span>
    </soc-tooltip>
  `,
})
class TooltipHost {
  variant = input<TooltipVariant>('default');
}

describe('content projection regressions', () => {
  for (const variant of ['banner', 'inline', 'plain'] as MessageVariant[]) {
    it(`Message (${variant}) renders both projected icon and content`, () => {
      const f = TestBed.createComponent(MessageHost);
      f.componentRef.setInput('variant', variant);
      f.detectChanges();
      expect(qa(f, '.proj-content').length).toBe(1);
      expect(q(f, '.proj-content').textContent).toBe('Texte');
      expect(qa(f, '.proj-icon').length).toBe(1);
    });
  }

  for (const variant of ['default', 'message'] as TooltipVariant[]) {
    it(`Tooltip (${variant}) renders its projected label`, () => {
      const f = TestBed.createComponent(TooltipHost);
      f.componentRef.setInput('variant', variant);
      f.detectChanges();
      expect(qa(document.body, '.proj-label').length).toBe(1);
      expect(q(document.body, '.proj-label').textContent).toBe('Aide');
    });
  }

  it('Tooltip shows on hover/focus, hides on leave, and wires aria-describedby', () => {
    const f = TestBed.createComponent(TooltipHost);
    f.detectChanges();
    const host = q(f, 'soc-tooltip');
    const bubble = () => q(document.body, '.proj-label').closest('[role=tooltip]') as HTMLElement;
    expect(bubble().style.visibility).toBe('hidden');
    host.dispatchEvent(new Event('mouseenter'));
    f.detectChanges();
    expect(bubble().style.visibility).toBe('visible');
    expect(host.getAttribute('aria-describedby')).toBe(bubble().id);
    host.dispatchEvent(new Event('mouseleave'));
    f.detectChanges();
    expect(bubble().style.visibility).toBe('hidden');
    host.dispatchEvent(new Event('focusin'));
    f.detectChanges();
    expect(bubble().style.visibility).toBe('visible');
  });

  it('Tooltip removes its portaled bubble when destroyed', () => {
    const f = TestBed.createComponent(TooltipHost);
    f.detectChanges();
    expect(qa(document.body, '[role=tooltip]').length).toBeGreaterThan(0);
    f.destroy();
    expect(qa(document.body, '[role=tooltip]').length).toBe(0);
  });
});
