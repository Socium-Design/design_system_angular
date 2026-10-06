import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { bodyPortals, pressEscape, q, qa } from '../../testing/helpers';
import { SocDrawer, SocDrawerDetailItem, type DrawerAnchor } from '../drawer/drawer';
import { SocDialog } from './dialog';

@Component({
  standalone: true,
  imports: [SocDialog, SocDrawer, SocDrawerDetailItem],
  template: `
    @if (alive()) {
      <soc-dialog
        [open]="dialogOpen()"
        (close)="log.push('dialog-close')"
        title="Confirmer"
        [primaryAction]="withActions() ? { label: 'OK', onClick: ok } : undefined"
        [secondaryAction]="withActions() ? { label: 'Annuler' } : undefined"
      >
        <p class="dialog-content">Sûr ?</p>
      </soc-dialog>
      <soc-drawer [open]="drawerOpen()" (close)="log.push('drawer-close')" title="Détail" [anchor]="anchor()" sectionTitle="Section">
        <soc-drawer-detail-item label="Email" value="a@b.c" />
      </soc-drawer>
    }
  `,
})
class OverlayHost {
  log: string[] = [];
  dialogOpen = signal(false);
  drawerOpen = signal(false);
  withActions = signal(true);
  anchor = signal<DrawerAnchor>('right');
  alive = signal(true);
  ok = () => this.log.push('ok');
}

describe('Dialog & Drawer', () => {
  function setup() {
    const fixture = TestBed.createComponent(OverlayHost);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance };
  }
  const overlays = () => qa(document.body, 'body > div.fixed');

  afterEach(() => expect(overlays().length).toBe(0)); // nothing leaks between tests

  describe('Dialog', () => {
    it('renders nothing while closed, and portals to <body> when open', () => {
      const { fixture, host } = setup();
      expect(overlays().length).toBe(0);
      host.dialogOpen.set(true);
      fixture.detectChanges();
      expect(overlays().length).toBe(1);
      expect(overlays()[0].parentElement).toBe(document.body);
      expect(overlays()[0].textContent).toContain('Confirmer');
      expect(overlays()[0].querySelector('.dialog-content')).not.toBeNull();
      host.dialogOpen.set(false);
      fixture.detectChanges();
    });

    it('emits close on Escape, on the backdrop and on the ✕ button — not on a click inside', () => {
      const { fixture, host } = setup();
      host.dialogOpen.set(true);
      fixture.detectChanges();
      pressEscape();
      expect(host.log).toEqual(['dialog-close']);
      overlays()[0].querySelector<HTMLElement>('[role=dialog]')!.click();
      expect(host.log.length).toBe(1);
      overlays()[0].click();
      expect(host.log.length).toBe(2);
      overlays()[0].querySelector<HTMLButtonElement>('button[aria-label=Fermer]')!.click();
      expect(host.log.length).toBe(3);
      host.dialogOpen.set(false);
      fixture.detectChanges();
    });

    it('does not react to Escape while closed', () => {
      const { host } = setup();
      pressEscape();
      expect(host.log).toEqual([]);
    });

    it('renders the footer from primary/secondary actions and calls their onClick', () => {
      const { fixture, host } = setup();
      host.dialogOpen.set(true);
      fixture.detectChanges();
      const labels = qa<HTMLButtonElement>(overlays()[0], 'button[socbutton]').map((b) => b.textContent!.trim());
      expect(labels).toEqual(['Annuler', 'OK']); // secondary first, like React
      qa<HTMLButtonElement>(overlays()[0], 'button[socbutton]')[1].click();
      expect(host.log).toEqual(['ok']);
      host.dialogOpen.set(false);
      fixture.detectChanges();
    });

    it('has no footer without actions', () => {
      const { fixture, host } = setup();
      host.withActions.set(false);
      host.dialogOpen.set(true);
      fixture.detectChanges();
      expect(qa(overlays()[0], 'button[socbutton]').length).toBe(0);
      host.dialogOpen.set(false);
      fixture.detectChanges();
    });

    it('removes an open overlay from <body> when the component is destroyed', () => {
      const { fixture, host } = setup();
      host.dialogOpen.set(true);
      host.drawerOpen.set(true);
      fixture.detectChanges();
      expect(overlays().length).toBe(2);
      host.alive.set(false);
      fixture.detectChanges();
      expect(overlays().length).toBe(0);
    });
  });

  describe('Drawer', () => {
    it('anchors to the requested side and renders its section title and detail items', () => {
      const { fixture, host } = setup();
      host.drawerOpen.set(true);
      fixture.detectChanges();
      const panel = q(overlays()[0], '[role=dialog]');
      expect(panel.className).toContain('right-0');
      expect(overlays()[0].textContent).toContain('Section');
      expect(overlays()[0].textContent).toContain('a@b.c');
      host.anchor.set('left');
      fixture.detectChanges();
      expect(q(overlays()[0], '[role=dialog]').className).toContain('left-0');
      host.anchor.set('bottom');
      fixture.detectChanges();
      expect(q(overlays()[0], '[role=dialog]').className).toContain('rounded-t-');
      host.drawerOpen.set(false);
      fixture.detectChanges();
    });

    it('emits close on Escape and on the backdrop', () => {
      const { fixture, host } = setup();
      host.drawerOpen.set(true);
      fixture.detectChanges();
      pressEscape();
      overlays()[0].click();
      expect(host.log).toEqual(['drawer-close', 'drawer-close']);
      host.drawerOpen.set(false);
      fixture.detectChanges();
    });
  });
});
