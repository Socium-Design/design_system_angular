import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, booleanAttribute, computed, input, model, output, signal, viewChild } from '@angular/core';
import { LucideUploadCloud } from '@lucide/angular';
import { SocFormControl, provideFormControl } from '../../internal/form-control';
import { SocButton } from '../../primitifs/button/button';

/**
 * Maps 1:1 to "Index/Input/UploadFile/*" tokens — see packages/tokens/tokens/components/input.json
 * in design_system (React reference repo, read only). Plain wrapper (`soc-upload-file`): a drop zone
 * (div) + a `soc-button`-styled trigger + a hidden native `<input type="file">`, not one native
 * element. `onFilesSelected` -> `filesSelected` output (carries the `FileList`, same as React);
 * `accept`/`multiple`/`disabled` are forwarded to the hidden input.
 *
 * Also a form control (`formControl`, `formControlName`, `ngModel`) whose value is the selected
 * `File[]` (a `FileList` can't be assigned, so the form works with a plain array; `null` after
 * `reset()` empties it). React's component doesn't list the chosen files — neither does this one; the
 * consumer displays them from `(filesSelected)` or the form value.
 */
@Component({
  selector: 'soc-upload-file',
  standalone: true,
  imports: [SocButton, LucideUploadCloud],
  providers: [provideFormControl(() => SocUploadFile)],
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
      <button socButton variant="tertiary" [disabled]="isDisabled()" (click)="fileInput.click()">Upload file</button>
      <input #fileInput type="file" [accept]="accept() ?? ''" [multiple]="multiple()" [disabled]="isDisabled()" class="hidden" (change)="onChange($event)" (blur)="onTouched()" />
    </div>
    @if (helperText()) {
      <p [class]="helperClass()">{{ helperText() }}</p>
    }
  `,
})
export class SocUploadFile extends SocFormControl<File[]> {
  readonly error = input(false, { transform: booleanAttribute });
  readonly warning = input(false, { transform: booleanAttribute });
  readonly helperText = input<string>();
  readonly accept = input<string>();
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly filesSelected = output<FileList>();
  readonly files = model<File[]>([]);

  protected readonly valueModel = this.files;
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  protected coerce(value: unknown): File[] {
    const files = Array.isArray(value) ? value : [];
    if (files.length === 0 && this.fileInput()) this.fileInput()!.nativeElement.value = '';
    return files;
  }

  protected readonly dragging = signal(false);

  protected onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (!this.isDisabled()) this.dragging.set(true);
  }

  protected onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragging.set(false);
    if (this.isDisabled()) return;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) this.select(files);
  }

  protected onChange(e: Event): void {
    const files = (e.target as HTMLInputElement).files;
    if (files) this.select(files);
  }

  private select(files: FileList): void {
    this.files.set(Array.from(files));
    this.filesSelected.emit(files);
    this.onTouched();
  }

  protected readonly zoneClass = computed(() => {
    const border = this.error()
      ? 'border-[var(--index-input-uploadfile-zone-border-error)]'
      : this.warning()
        ? 'border-[var(--index-input-uploadfile-zone-border-warning)]'
        : this.dragging()
          ? 'border-[var(--index-input-uploadfile-zone-border-drag)]'
          : 'border-[var(--index-input-uploadfile-zone-border-default)]';
    return `flex w-full flex-col items-center justify-center gap-[var(--index-input-uploadfile-zone-gap)] rounded-[var(--index-input-uploadfile-zone-radius)] border-[length:var(--index-input-uploadfile-zone-border-width)] border-dashed bg-[var(--index-input-uploadfile-zone-bg)] px-[var(--index-input-uploadfile-zone-pad-h)] py-[var(--index-input-uploadfile-zone-pad-v)] ${border} ${this.isDisabled() ? 'opacity-50' : ''}`;
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
