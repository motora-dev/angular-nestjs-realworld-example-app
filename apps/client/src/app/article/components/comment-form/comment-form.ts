import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxsFormDirective } from '@ngxs/form-plugin';

import { ArticleFacade } from '$domains/article';

interface CommentForm {
  body: FormControl<string>;
}

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxsFormDirective],
  templateUrl: './comment-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentFormComponent {
  private readonly articleFacade = inject(ArticleFacade);

  readonly userImage = input<string>('');
  readonly userName = input<string>('');

  readonly submitComment = output<string>();

  readonly isFormInvalid = toSignal(this.articleFacade.isCommentFormInvalid$);

  readonly commentForm = new FormGroup<CommentForm>({
    body: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
  });

  onSubmit(): void {
    this.submitComment.emit(this.commentForm.getRawValue().body.trim());
  }
}
