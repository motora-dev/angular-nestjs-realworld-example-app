import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { RxLet } from '@rx-angular/template/let';

import { AuthFacade } from '$modules/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, RxLet],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterComponent {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);

  readonly pendingEmail$ = this.authFacade.pendingRegistrationEmail$;

  readonly username = signal('');
  readonly agreeToTerms = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onUsernameChange(value: string): void {
    this.username.set(value);
    this.errorMessage.set(null);
  }

  onAgreeToTermsChange(checked: boolean): void {
    this.agreeToTerms.set(checked);
  }

  onSubmit(): void {
    const usernameValue = this.username();

    // Validation
    if (!usernameValue || usernameValue.length < 3) {
      this.errorMessage.set('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) {
      this.errorMessage.set('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!this.agreeToTerms()) {
      this.errorMessage.set('You must agree to the terms of service');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authFacade.register(usernameValue).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
      },
    });
  }
}
