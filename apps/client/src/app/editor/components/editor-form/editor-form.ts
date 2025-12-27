import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxsFormDirective } from '@ngxs/form-plugin';
import { RxPush } from '@rx-angular/template/push';

import { EditorFacade } from '$domains/editor';
import { SpinnerFacade } from '$modules/spinner';

interface ArticleForm {
  title: FormControl<string>;
  description: FormControl<string>;
  body: FormControl<string>;
}

export interface EditorFormSubmitEvent {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

@Component({
  selector: 'app-editor-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxsFormDirective, RxPush],
  templateUrl: './editor-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFormComponent {
  private readonly editorFacade = inject(EditorFacade);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly initialTagList = input<string[]>([]);

  readonly formSubmit = output<EditorFormSubmitEvent>();

  readonly tagList = signal<string[]>([]);
  readonly isLoading$ = this.spinnerFacade.isLoading$;
  readonly isFormInvalid$ = this.editorFacade.isFormInvalid$;

  readonly articleForm = new FormGroup<ArticleForm>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    body: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly tagField = new FormControl<string>('', { nonNullable: true });

  constructor() {
    // Set initial tag list from input
    const tags = this.initialTagList();
    if (tags.length > 0) {
      this.tagList.set(tags);
    }
  }

  addTag(): void {
    const tag = this.tagField.value.trim();
    if (tag && !this.tagList().includes(tag)) {
      this.tagList.update((tags) => [...tags, tag]);
    }
    this.tagField.reset('');
  }

  removeTag(tagToRemove: string): void {
    this.tagList.update((tags) => tags.filter((tag) => tag !== tagToRemove));
  }

  onSubmit(): void {
    if (this.articleForm.invalid) return;

    this.addTag();

    const formValue = this.articleForm.getRawValue();
    this.formSubmit.emit({
      title: formValue.title,
      description: formValue.description,
      body: formValue.body,
      tagList: this.tagList(),
    });
  }
}
