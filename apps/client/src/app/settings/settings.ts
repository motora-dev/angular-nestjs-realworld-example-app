import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { take } from 'rxjs';

import { Errors, ListErrorsComponent } from '$components/errors';
import { AuthFacade, User } from '$modules/auth';

interface SettingsForm {
  image: FormControl<string>;
  username: FormControl<string>;
  bio: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, ListErrorsComponent],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);

  readonly errors = signal<Errors | null>(null);
  readonly isSubmitting = signal(false);

  readonly settingsForm = new FormGroup<SettingsForm>({
    image: new FormControl('', { nonNullable: true }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bio: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  constructor() {
    // Load current user data
    this.authFacade.currentUser$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.settingsForm.patchValue({
          image: user.image || '',
          username: user.username,
          bio: user.bio || '',
          email: user.email,
        });
      }
    });
  }

  logout(): void {
    this.authFacade.logout();
    this.router.navigate(['/']);
  }

  submitForm(): void {
    if (this.settingsForm.invalid) return;

    this.isSubmitting.set(true);
    const userData = this.settingsForm.value as Partial<User>;

    this.authFacade.updateUser(userData).subscribe({
      next: (user) => {
        this.router.navigate(['/profile', user.username]);
      },
      error: (err) => {
        this.errors.set(err);
        this.isSubmitting.set(false);
      },
    });
  }
}
