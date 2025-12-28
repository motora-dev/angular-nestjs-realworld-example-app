import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SetCurrentUser } from '$modules/auth/store';
import { SpinnerFacade } from '$modules/spinner';
import { SettingsApi } from './api';
import { SettingsFormModel } from './model';
import { SettingsFacade } from './settings.facade';
import { ClearSettingsForm, SetSettingsForm, SettingsState } from './store';

describe('SettingsFacade', () => {
  let facade: SettingsFacade;
  let store: Store;
  let settingsApi: SettingsApi;
  let spinnerFacade: SpinnerFacade;

  const mockUser: SettingsFormModel = {
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test Bio',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(() => {
    const mockSettingsApi = {
      getCurrentUser: vi.fn(() => of(mockUser)),
      updateUser: vi.fn(() => of(mockUser)),
    };

    const mockSpinnerFacade = {
      withSpinner: vi.fn(() => (source: any) => source),
    };

    TestBed.configureTestingModule({
      providers: [
        SettingsFacade,
        provideStore([SettingsState]),
        { provide: SettingsApi, useValue: mockSettingsApi },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(SettingsFacade);
    store = TestBed.inject(Store);
    settingsApi = TestBed.inject(SettingsApi);
    spinnerFacade = TestBed.inject(SpinnerFacade);
  });

  describe('loadSettingsForm', () => {
    it('should load settings form and dispatch SetSettingsForm and SetCurrentUser actions', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.loadSettingsForm();

      expect(settingsApi.getCurrentUser).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetSettingsForm(mockUser));
        expect(dispatchSpy).toHaveBeenCalledWith(
          new SetCurrentUser({
            image: mockUser.image,
            username: mockUser.username,
            bio: mockUser.bio,
            email: mockUser.email,
          }),
        );
      }, 100);
    });

    it('should not load settings form on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          SettingsFacade,
          provideStore([SettingsState]),
          { provide: SettingsApi, useValue: settingsApi },
          { provide: SpinnerFacade, useValue: spinnerFacade },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const serverFacade = TestBed.inject(SettingsFacade);
      serverFacade.loadSettingsForm();

      expect(settingsApi.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user and dispatch SetCurrentUser action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const userData: Partial<SettingsFormModel> = {
        bio: 'Updated Bio',
      };

      facade.updateUser(userData).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });

      expect(settingsApi.updateUser).toHaveBeenCalledWith(userData);
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          new SetCurrentUser({
            image: mockUser.image,
            username: mockUser.username,
            bio: mockUser.bio,
            email: mockUser.email,
          }),
        );
      }, 100);
    });
  });

  describe('clearSettingsForm', () => {
    it('should dispatch ClearSettingsForm action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.clearSettingsForm();

      expect(dispatchSpy).toHaveBeenCalledWith(new ClearSettingsForm());
    });
  });

  describe('selectors', () => {
    it('should expose isFormInvalid$ selector', () => {
      expect(facade.isFormInvalid$).toBeDefined();
    });

    it('should expose isFormDirty$ selector', () => {
      expect(facade.isFormDirty$).toBeDefined();
    });

    it('should expose formValue$ selector', () => {
      expect(facade.formValue$).toBeDefined();
    });
  });
});
