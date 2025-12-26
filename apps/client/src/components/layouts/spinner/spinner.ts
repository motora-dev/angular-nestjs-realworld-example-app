import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';

import { SpinnerFacade } from '$modules/spinner';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './spinner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly isLoading = toSignal(this.spinnerFacade.isLoading$, { initialValue: false });
  readonly message = toSignal(this.spinnerFacade.message$, { initialValue: null });
}
