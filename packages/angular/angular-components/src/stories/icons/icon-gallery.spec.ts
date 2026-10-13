import { TestBed } from '@angular/core/testing';
import { q, qa, type } from '../../testing/helpers';
import { KIT_ICONS } from './generated/kit-icons.generated';
import { SocIconGallery, iconSnippet } from './icon-gallery';

describe('Fondations/Icônes (SocIconGallery)', () => {
  const setup = () => {
    const f = TestBed.createComponent(SocIconGallery);
    f.detectChanges();
    return f;
  };
  const tiles = (f: ReturnType<typeof setup>) => qa<HTMLButtonElement>(f, 'ul > li > button');
  /** `whenStable()` doesn't wait for the clipboard promise nor for webpack's lazy chunk: poll the outcome. */
  const until = async (f: ReturnType<typeof setup>, done: () => boolean) => {
    for (let i = 0; i < 200 && !done(); i++) {
      await new Promise((r) => setTimeout(r, 10));
      f.detectChanges();
    }
    expect(done()).withContext('condition not reached within 2 s').toBeTrue();
  };

  it('the kit list is generated from the sources, with each icon’s components (src and Labs)', () => {
    const byClass = new Map(KIT_ICONS.map((i) => [i.className, i]));
    // Spot checks against real imports: Checkbox draws LucideCheck, InlineEdit (Labs) draws LucidePencil.
    expect(byClass.get('LucideCheck')!.components.map((c) => c.name)).toContain('SocCheckbox');
    expect(byClass.get('LucidePencil')!.components).toContain({ name: 'SocLabsInlineEdit', labs: true });
    // Deprecated aliases are folded into the canonical icon (Card imports LucideMoreHorizontal).
    expect(byClass.get('LucideEllipsis')!.importedAs).toContain('LucideMoreHorizontal');
    expect(byClass.has('LucideMoreHorizontal')).toBeFalse();
  });

  it('renders every kit icon, filtered by the search (name, class or alias)', () => {
    const f = setup();
    expect(tiles(f).length).toBe(KIT_ICONS.length);
    type(q<HTMLInputElement>(f, 'soc-search-bar input'), 'chevron-down');
    f.detectChanges();
    expect(tiles(f).map((t) => t.textContent)).toEqual([jasmine.stringContaining('LucideChevronDown')]);
    // Alias: "more-horizontal" is a former name of "ellipsis".
    type(q<HTMLInputElement>(f, 'soc-search-bar input'), 'more horizontal');
    f.detectChanges();
    expect(tiles(f).length).toBe(1);
    expect(tiles(f)[0].textContent).toContain('LucideEllipsis');
  });

  it('size and colour controls drive the rendered icons (kit tokens, no raw colour)', () => {
    const f = setup();
    q<HTMLButtonElement>(f, '[aria-labelledby=icon-size-label] button:nth-child(3)').click();
    q<HTMLButtonElement>(f, '[aria-labelledby=icon-color-label] button:nth-child(3)').click();
    f.detectChanges();
    const svg = q<SVGElement>(tiles(f)[0], 'svg');
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.parentElement!.className).toContain('text-[var(--bridges-color-text-action)]');
  });

  it('a click copies the Angular snippet and shows "Copié"', async () => {
    const write = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    const f = setup();
    const check = KIT_ICONS.find((i) => i.className === 'LucideCheck')!;
    tiles(f)[KIT_ICONS.indexOf(check)].click();
    await until(f, () => !!tiles(f)[KIT_ICONS.indexOf(check)].textContent?.includes('Copié'));
    expect(write).toHaveBeenCalledOnceWith(
      `import { LucideCheck } from '@lucide/angular';\n\n<svg lucideCheck [size]="20" [strokeWidth]="1.5" class="text-[var(--bridges-color-text-primary)]"></svg>`,
    );
  });

  it('the snippet uses the icon’s own selector (digits, deprecated names)', () => {
    const house = { name: 'house', className: 'LucideHouse', selector: 'lucideHouse', aliases: ['home'] };
    expect(iconSnippet(house, 16, 'secondary')).toContain('<svg lucideHouse [size]="16"');
  });

  it('the full library is only loaded when its tab is opened, then searchable', async () => {
    const f = setup();
    expect(q(f, '[role=tablist]').textContent).toContain('Bibliothèque Lucide');
    expect(f.componentInstance['library']()).toBeNull();
    f.componentInstance.selectTab('library');
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Chargement');
    await until(f, () => !!f.componentInstance['library']());
    const total = f.componentInstance['library']()!.length;
    expect(total).toBeGreaterThan(1000);
    expect(tiles(f).length).toBe(300); // first page only
    type(q<HTMLInputElement>(f, 'soc-search-bar input'), 'house');
    f.detectChanges();
    expect(tiles(f).map((t) => t.title)).toContain('LucideHouse');
  });
});
