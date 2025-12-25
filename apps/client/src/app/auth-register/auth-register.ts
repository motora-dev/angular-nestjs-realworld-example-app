import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxLet } from '@rx-angular/template/let';
import { RxPush } from '@rx-angular/template/push';

import { AuthRegisterFacade } from '$domains/auth-register';
import { SpinnerFacade } from '$modules/spinner';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, RxLet, RxPush],
  templateUrl: './auth-register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthRegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authRegisterFacade = inject(AuthRegisterFacade);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly pendingEmail$ = this.authRegisterFacade.pendingRegistrationEmail$;
  readonly isLoading$ = this.spinnerFacade.isLoading$;

  constructor() {
    this.authRegisterFacade.loadPendingRegistration();
  }

  readonly registerForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    agreeToTerms: [false, [Validators.requiredTrue]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { username } = this.registerForm.getRawValue();

    this.authRegisterFacade.register(username).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
    });
  }
}
