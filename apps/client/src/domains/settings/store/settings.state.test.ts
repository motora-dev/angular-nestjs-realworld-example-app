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
      const form = store.selectSnapshot((state) => state.settings.settingsForm);
      expect(form).toEqual({
        model: {
          image: '',
          username: '',
          bio: '',
          email: '',
        },
        dirty: false,
        status: '',
        errors: {},
      });
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

      const form = store.selectSnapshot((state) => state.settings.settingsForm);
      expect(form.model).toEqual(mockForm);
      expect(form.dirty).toBe(false);
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

      const formValue = store.selectSnapshot((state) => state.settings.settingsForm.model);
      expect(formValue).toEqual({
        image: '',
        username: '',
        bio: '',
        email: '',
      });
    });
  });
});
