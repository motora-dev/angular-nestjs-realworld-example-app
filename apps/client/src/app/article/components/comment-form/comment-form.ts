import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './comment-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentFormComponent {
  readonly userImage = input<string>('');

  readonly submitComment = output<string>();

  readonly commentBody = signal('');
  readonly isSubmitting = signal(false);

  onSubmit(): void {
    const body = this.commentBody().trim();
    if (!body) return;

    this.isSubmitting.set(true);
    this.submitComment.emit(body);
    this.commentBody.set('');
    this.isSubmitting.set(false);
  }
}
