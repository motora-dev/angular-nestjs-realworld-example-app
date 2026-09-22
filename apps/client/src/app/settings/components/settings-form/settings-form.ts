import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxsFormDirective } from '@ngxs/form-plugin';

import { SettingsFacade, SettingsFormModel } from '$domains/settings';
import { SpinnerFacade } from '$modules/spinner';

interface SettingsForm {
  image: FormControl<string>;
  username: FormControl<string>;
  bio: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  selector: 'app-settings-form',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, NgxsFormDirective],
  templateUrl: './settings-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsFormComponent {
  private readonly settingsFacade = inject(SettingsFacade);
  private readonly spinnerFacade = inject(SpinnerFacade);

  readonly formSubmit = output<SettingsFormModel>();

  readonly isLoading$ = this.spinnerFacade.isLoading$;
  readonly isFormInvalid$ = this.settingsFacade.isFormInvalid$;

  readonly settingsForm = new FormGroup<SettingsForm>({
    image: new FormControl('', { nonNullable: true }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bio: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  onSubmit(): void {
    if (this.settingsForm.invalid) return;

    const formValue = this.settingsForm.getRawValue();
    this.formSubmit.emit(formValue);
  }
}
