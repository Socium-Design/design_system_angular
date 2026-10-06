import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { q } from '../../testing/helpers';
import { SocUploadFile } from './upload-file';

@Component({
  standalone: true,
  imports: [SocUploadFile],
  template: `<soc-upload-file [error]="error()" [disabled]="disabled()" helperText="Aide" (filesSelected)="log.push($event.length)" />`,
})
class Host {
  log: number[] = [];
  error = signal(false);
  disabled = signal(false);
}

describe('UploadFile', () => {
  const setup = () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    return f;
  };
  const zone = (f: ReturnType<typeof setup>) => q(f, 'soc-upload-file > div');
  const files = (...names: string[]) => {
    const dt = new DataTransfer();
    names.forEach((n) => dt.items.add(new File(['x'], n)));
    return dt;
  };

  it('emits filesSelected on drop and highlights the zone while dragging over it', () => {
    const f = setup();
    zone(f).dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    f.detectChanges();
    expect(zone(f).className).toContain('border-drag');
    zone(f).dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: files('a.pdf', 'b.pdf') }));
    f.detectChanges();
    expect(f.componentInstance.log).toEqual([2]);
    expect(zone(f).className).not.toContain('border-drag');
  });

  it('ignores drag and drop when disabled', () => {
    const f = setup();
    f.componentInstance.disabled.set(true);
    f.detectChanges();
    zone(f).dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    zone(f).dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: files('a.pdf') }));
    expect(f.componentInstance.log).toEqual([]);
    expect(q<HTMLInputElement>(f, 'input[type=file]').disabled).toBeTrue();
  });

  it('error styling wins over drag styling; helper text follows the error flag', () => {
    const f = setup();
    f.componentInstance.error.set(true);
    f.detectChanges();
    zone(f).dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true }));
    f.detectChanges();
    expect(zone(f).className).toContain('border-error');
    expect(q(f, 'soc-upload-file > p').className).toContain('error-text');
  });

  it('the "Upload file" button opens the native picker', () => {
    const f = setup();
    const input = q<HTMLInputElement>(f, 'input[type=file]');
    const spy = spyOn(input, 'click');
    q<HTMLButtonElement>(f, 'button[socbutton]').click();
    expect(spy).toHaveBeenCalled();
  });
});
