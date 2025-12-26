import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ErrorFacade } from '$modules/error';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './error-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogComponent {
  private readonly errorFacade = inject(ErrorFacade);
  private readonly translate = inject(TranslateService);

  readonly error = toSignal(this.errorFacade.error$, { initialValue: null });

  readonly errorMessageKey = computed(() => 'An unexpected error occurred');

  close(): void {
    this.errorFacade.clearError();
  }
}
