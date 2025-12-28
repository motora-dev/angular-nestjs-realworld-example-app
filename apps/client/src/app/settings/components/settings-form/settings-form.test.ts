import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SettingsFacade } from '$domains/settings';
import { SettingsState } from '$domains/settings/store';
import { SpinnerFacade } from '$modules/spinner';
import { SpinnerState } from '$modules/spinner/store';
import { SettingsFormComponent } from './settings-form';

describe('SettingsFormComponent', () => {
  let component: SettingsFormComponent;
  let fixture: ComponentFixture<SettingsFormComponent>;
  let mockSettingsFacade: {
    isFormInvalid$: BehaviorSubject<boolean>;
  };
  let mockSpinnerFacade: {
    isLoading$: BehaviorSubject<boolean>;
  };

  beforeEach(async () => {
    mockSettingsFacade = {
      isFormInvalid$: new BehaviorSubject<boolean>(false),
    };

    mockSpinnerFacade = {
      isLoading$: new BehaviorSubject<boolean>(false),
    };

    await TestBed.configureTestingModule({
      imports: [SettingsFormComponent],
      providers: [
        provideStore([SettingsState, SpinnerState]),
        { provide: SettingsFacade, useValue: mockSettingsFacade },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('settingsForm', () => {
    it('should be invalid initially', () => {
      expect(component.settingsForm.invalid).toBe(true);
    });

    it('should be valid with valid inputs', () => {
      component.settingsForm.patchValue({
        image: 'https://example.com/image.jpg',
        username: 'testuser',
        bio: 'Test Bio',
        email: 'test@example.com',
      });

      expect(component.settingsForm.valid).toBe(true);
    });

    it('should require username', () => {
      component.settingsForm.patchValue({
        username: '',
        email: 'test@example.com',
      });

      expect(component.settingsForm.controls.username.hasError('required')).toBe(true);
    });

    it('should require email', () => {
      component.settingsForm.patchValue({
        username: 'testuser',
        email: '',
      });

      expect(component.settingsForm.controls.email.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      component.settingsForm.patchValue({
        username: 'testuser',
        email: 'invalid-email',
      });

      expect(component.settingsForm.controls.email.hasError('email')).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      const emitSpy = vi.spyOn(component.formSubmit, 'emit');

      component.onSubmit();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit formSubmit event with form data when form is valid', () => {
      const emitSpy = vi.spyOn(component.formSubmit, 'emit');
      const formData = {
        image: 'https://example.com/image.jpg',
        username: 'testuser',
        bio: 'Test Bio',
        email: 'test@example.com',
      };

      component.settingsForm.patchValue(formData);
      component.onSubmit();

      expect(emitSpy).toHaveBeenCalledWith(formData);
    });
  });

  describe('observables', () => {
    it('should expose isLoading$ from spinnerFacade', async () => {
      let isLoading = false;
      component.isLoading$.subscribe((value) => {
        isLoading = value;
      });

      expect(isLoading).toBe(false);

      mockSpinnerFacade.isLoading$.next(true);
      expect(isLoading).toBe(true);
    });

    it('should expose isFormInvalid$ from settingsFacade', async () => {
      let isInvalid = false;
      component.isFormInvalid$.subscribe((value) => {
        isInvalid = value;
      });

      expect(isInvalid).toBe(false);

      mockSettingsFacade.isFormInvalid$.next(true);
      expect(isInvalid).toBe(true);
    });
  });
});
