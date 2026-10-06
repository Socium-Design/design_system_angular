import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q, qa } from '../../testing/helpers';
import { SocAvatar } from '../avatar/avatar';
import { SocAccordion } from './accordion';

@Component({
  standalone: true,
  imports: [SocAccordion, SocAvatar],
  template: `
    <soc-accordion label="Titre" [(open)]="open"><p class="panel">Contenu</p></soc-accordion>
    <soc-avatar label="AD" />
    <soc-avatar label="BD" color="purple" mode="solid" size="lg" name="Bob" subtitle="Dev" namePosition="left" />
  `,
})
class Host {
  open = signal(false);
}

describe('Accordion & Avatar', () => {
  const setup = () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    return f;
  };

  it('Accordion is a block container (its width/border/overflow need a box) that toggles', () => {
    const f = setup();
    expect(q(f, 'soc-accordion').className).toContain('block');
    const header = q<HTMLButtonElement>(f, 'soc-accordion button');
    expect(header.getAttribute('aria-expanded')).toBe('false');
    header.click();
    f.detectChanges();
    expect(f.componentInstance.open()).toBeTrue();
    expect(header.getAttribute('aria-expanded')).toBe('true');
  });

  it('Avatar works with only a label (defaults) and with every option', () => {
    const f = setup();
    const [plain, rich] = qa(f, 'soc-avatar');
    expect(plain.textContent!.trim()).toBe('AD');
    expect(plain.className).toBe(''); // no layout classes without a name, like React
    expect(rich.textContent).toContain('Bob');
    expect(rich.textContent).toContain('Dev');
    expect(rich.className).toContain('inline-flex');
    // name on the left: the text block comes before the circle
    expect(rich.firstElementChild!.textContent).toContain('Bob');
  });
});
