import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxsFormDirective } from '@ngxs/form-plugin';

import { InputDirective } from '$shared/ui/input';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [InputDirective, NgxsFormDirective, ReactiveFormsModule, TranslatePipe],
  templateUrl: './markdown-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownEditorComponent {
  private readonly fb = inject(FormBuilder);

  readonly isFormInvalid = input<boolean>(false);
  readonly isFormDirty = input<boolean>(false);

  readonly save = output<void>();

  readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
  });

  onSave(): void {
    this.save.emit();
  }
}
