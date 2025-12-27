import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SettingsFacade, SettingsFormModel } from '$domains/settings';
import { AuthFacade } from '$modules/auth';
import { SettingsFormComponent } from './components/settings-form';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SettingsFormComponent],
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly settingsFacade = inject(SettingsFacade);

  constructor() {
    this.settingsFacade.loadSettingsForm();
  }

  onFormSubmit(formData: SettingsFormModel): void {
    this.settingsFacade.updateUser(formData).subscribe({
      next: (user) => {
        this.router.navigate(['/profile', user.username]);
      },
    });
  }

  logout(): void {
    this.authFacade.logout();
    this.router.navigate(['/']);
  }
}
