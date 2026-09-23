import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxsFormDirective } from '@ngxs/form-plugin';

import { EditorFormModel } from '$domains/editor';
import { SpinnerFacade } from '$modules/spinner';

interface ArticleForm {
  title: FormControl<string>;
  description: FormControl<string>;
  body: FormControl<string>;
  tagList: FormControl<string[]>;
}

@Component({
  selector: 'app-editor-form',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, NgxsFormDirective],
  templateUrl: './editor-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFormComponent {
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly formSubmit = output<EditorFormModel>();

  readonly isLoading$ = this.spinnerFacade.isLoading$;

  readonly articleForm = new FormGroup<ArticleForm>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tagList: new FormControl<string[]>([], { nonNullable: true }),
  });

  readonly tagField = new FormControl<string>('', { nonNullable: true });

  addTag(): void {
    const tag = this.tagField.value.trim();
    const tags = this.articleForm.controls.tagList.value;
    if (tag && !tags.includes(tag)) {
      this.articleForm.controls.tagList.setValue([...tags, tag]);
    }
    this.tagField.reset('');
  }

  removeTag(tagToRemove: string): void {
    this.articleForm.controls.tagList.setValue(
      this.articleForm.controls.tagList.value.filter((tag) => tag !== tagToRemove),
    );
  }

  onSubmit(): void {
    if (this.articleForm.invalid) return;

    this.addTag();
    this.formSubmit.emit(this.articleForm.getRawValue());
  }
}
