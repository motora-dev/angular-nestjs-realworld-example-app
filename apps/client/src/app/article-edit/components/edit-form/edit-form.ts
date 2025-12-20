import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxsFormDirective } from '@ngxs/form-plugin';

import { InputFieldComponent, TagsFieldComponent } from '$components/fields';
import { InputDirective } from '$shared/ui/input';

@Component({
  selector: 'app-edit-form',
  standalone: true,
  imports: [
    InputDirective,
    InputFieldComponent,
    NgxsFormDirective,
    ReactiveFormsModule,
    TagsFieldComponent,
    TranslatePipe,
  ],
  templateUrl: './edit-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: [''],
    tags: [[] as string[]],
  });
}
