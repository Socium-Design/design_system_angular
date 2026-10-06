import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, output, signal } from '@angular/core';
import { LucideUploadCloud } from '@lucide/angular';
import { SocButton } from '../../primitifs/button/button';

/**
 * Maps 1:1 to "Index/Input/UploadFile/*" tokens — see packages/tokens/tokens/components/input.json
 * in design_system (React reference repo, read only). Plain wrapper (`soc-upload-file`): a drop zone
 * (div) + a `soc-button`-styled trigger + a hidden native `<input type="file">`, not one native
 * element. `onFilesSelected` -> `filesSelected` output (carries the `FileList`, same as React);
 * `accept`/`multiple`/`disabled` are forwarded to the hidden input.
 */
@Component({
  selector: 'soc-upload-file',
  standalone: true,
  imports: [SocButton, LucideUploadCloud],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'flex w-full flex-col gap-2' },
  template: `
    <div (dragover)="onDragOver($event)" (dragleave)="dragging.set(false)" (drop)="onDrop($event)" [class]="zoneClass()">
      <svg lucideUploadCloud class="size-[var(--index-input-uploadfile-zone-icon-size)] text-[var(--index-input-uploadfile-zone-icon-color)]" [strokeWidth]="1.5"></svg>
      <p class="text-[length:var(--index-input-uploadfile-zone-text-size)] text-[var(--index-input-uploadfile-zone-text-color)] [font-family:var(--index-input-uploadfile-zone-text-font)] [font-weight:var(--index-input-uploadfile-zone-text-weight)]">
        Drag &amp; drop your files here
      </p>
      <p class="text-[length:var(--index-input-uploadfile-zone-text-size)] text-[var(--index-input-uploadfile-zone-separator-color)]">ou</p>
      <button socButton variant="tertiary" [disabled]="disabled()" (click)="fileInput.click()">Upload file</button>
      <input #fileInput type="file" [accept]="accept() ?? ''" [multiple]="multiple()" [disabled]="disabled()" class="hidden" (change)="onChange($event)" />
    </div>
    @if (helperText()) {
      <p [class]="helperClass()">{{ helperText() }}</p>
    }
  `,
  styleUrl: './upload-file.css',
})
export class SocUploadFile {
  readonly error = input(false);
  readonly warning = input(false);
  readonly helperText = input<string>();
  readonly accept = input<string>();
  readonly multiple = input(false);
  readonly disabled = input(false);
  readonly filesSelected = output<FileList>();

  protected readonly dragging = signal(false);

  protected onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.disabled()) this.dragging.set(true);
  }

  protected onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    if (this.disabled()) return;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) this.filesSelected.emit(files);
  }

  protected onChange(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (files) this.filesSelected.emit(files);
  }

  protected readonly zoneClass = computed(() => {
    const border = this.error()
      ? 'border-[var(--index-input-uploadfile-zone-border-error)]'
      : this.warning()
        ? 'border-[var(--index-input-uploadfile-zone-border-warning)]'
        : this.dragging()
          ? 'border-[var(--index-input-uploadfile-zone-border-drag)]'
          : 'border-[var(--index-input-uploadfile-zone-border-default)]';
    return `flex w-full flex-col items-center justify-center gap-[var(--index-input-uploadfile-zone-gap)] rounded-[var(--index-input-uploadfile-zone-radius)] border-[length:var(--index-input-uploadfile-zone-border-width)] border-dashed bg-[var(--index-input-uploadfile-zone-bg)] px-[var(--index-input-uploadfile-zone-pad-h)] py-[var(--index-input-uploadfile-zone-pad-v)] ${border} ${this.disabled() ? 'opacity-50' : ''}`;
  });

  protected readonly helperClass = computed(
    () =>
      `text-[length:var(--index-input-uploadfile-zone-text-size)] ${
        this.error()
          ? 'text-[var(--index-input-uploadfile-zone-error-text)]'
          : this.warning()
            ? 'text-[var(--index-input-uploadfile-zone-warning-text)]'
            : 'text-[var(--index-input-uploadfile-zone-text-color)]'
      }`,
  );
}
