import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { ClearSettingsForm, SetSettingsForm } from './settings.actions';
import { SettingsFormModel } from '../model';
import { SettingsState } from './settings.state';

describe('SettingsState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([SettingsState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have default settings form as initial state', () => {
      const formValue = store.selectSnapshot(SettingsState.getFormValue);
      expect(formValue).toEqual({
        image: '',
        username: '',
        bio: '',
        email: '',
      });
    });

    it('should have invalid form status as initial state', () => {
      const isInvalid = store.selectSnapshot(SettingsState.isFormInvalid);
      expect(isInvalid).toBe(true);
    });

    it('should have non-dirty form as initial state', () => {
      const isDirty = store.selectSnapshot(SettingsState.isFormDirty);
      expect(isDirty).toBe(false);
    });
  });

  describe('isFormInvalid selector', () => {
    it('should return true when form status is not VALID', () => {
      const isInvalid = store.selectSnapshot(SettingsState.isFormInvalid);
      expect(isInvalid).toBe(true);
    });
  });

  describe('isFormDirty selector', () => {
    it('should return false when form is not dirty', () => {
      const isDirty = store.selectSnapshot(SettingsState.isFormDirty);
      expect(isDirty).toBe(false);
    });
  });

  describe('getFormValue selector', () => {
    it('should return form value from state', () => {
      const mockForm: SettingsFormModel = {
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      store.dispatch(new SetSettingsForm(mockForm));

      const formValue = store.selectSnapshot(SettingsState.getFormValue);
      expect(formValue).toEqual(mockForm);
    });

    it('should return null when settingsForm is undefined', () => {
      const state = { settingsForm: undefined } as any;
      const formValue = SettingsState.getFormValue(state);
      expect(formValue).toBeNull();
    });

    it('should return null when settingsForm.model is undefined', () => {
      const state = {
        settingsForm: {
          model: undefined,
          dirty: false,
          status: '',
          errors: {},
        },
      } as any;
      const formValue = SettingsState.getFormValue(state);
      expect(formValue).toBeNull();
    });
  });

  describe('SetSettingsForm action', () => {
    it('should set settings form in state', () => {
      const mockForm: SettingsFormModel = {
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      store.dispatch(new SetSettingsForm(mockForm));

      const formValue = store.selectSnapshot(SettingsState.getFormValue);
      expect(formValue).toEqual(mockForm);
    });

    it('should set dirty to false when form is set', () => {
      const mockForm: SettingsFormModel = {
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      store.dispatch(new SetSettingsForm(mockForm));

      const isDirty = store.selectSnapshot(SettingsState.isFormDirty);
      expect(isDirty).toBe(false);
    });
  });

  describe('ClearSettingsForm action', () => {
    it('should reset settings form to default state', () => {
      const mockForm: SettingsFormModel = {
        username: 'testuser',
        email: 'test@example.com',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      store.dispatch(new SetSettingsForm(mockForm));
      store.dispatch(new ClearSettingsForm());

      const formValue = store.selectSnapshot(SettingsState.getFormValue);
      expect(formValue).toEqual({
        image: '',
        username: '',
        bio: '',
        email: '',
      });
    });
  });
});
