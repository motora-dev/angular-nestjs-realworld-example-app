import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { NgxsFormDirective } from '@ngxs/form-plugin';
import { RxPush } from '@rx-angular/template/push';

import { ArticleFacade } from '$domains/article';

interface CommentForm {
  body: FormControl<string>;
}

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgxsFormDirective, RxPush, TranslatePipe],
  templateUrl: './comment-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentFormComponent {
  private readonly articleFacade = inject(ArticleFacade);

  readonly userImage = input<string>('');

  readonly submitComment = output<string>();

  readonly isFormInvalid$ = this.articleFacade.isCommentFormInvalid$;

  readonly commentForm = new FormGroup<CommentForm>({
    body: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
  });

  onSubmit(): void {
    this.submitComment.emit(this.commentForm.getRawValue().body.trim());
  }
}
