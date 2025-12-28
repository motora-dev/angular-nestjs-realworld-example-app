import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SetAuthenticated } from '$modules/auth/store';
import { SpinnerFacade } from '$modules/spinner';
import { AuthRegisterApi, RegisterResponse, PendingRegistrationResponse } from './api';
import { AuthRegisterFacade } from './auth-register.facade';
import { AuthRegisterState, ClearPendingRegistration, SetPendingRegistration } from './store';

describe('AuthRegisterFacade', () => {
  let facade: AuthRegisterFacade;
  let store: Store;
  let authRegisterApi: AuthRegisterApi;
  let spinnerFacade: SpinnerFacade;

  const mockRegisterResponse: RegisterResponse = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockPendingRegistrationResponse: PendingRegistrationResponse = {
    email: 'test@example.com',
  };

  beforeEach(() => {
    const mockAuthRegisterApi = {
      getPendingRegistration: vi.fn(() => of(mockPendingRegistrationResponse)),
      register: vi.fn(() => of(mockRegisterResponse)),
    };

    const mockSpinnerFacade = {
      withSpinner: vi.fn(() => (source: any) => source),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthRegisterFacade,
        provideStore([AuthRegisterState]),
        { provide: AuthRegisterApi, useValue: mockAuthRegisterApi },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(AuthRegisterFacade);
    store = TestBed.inject(Store);
    authRegisterApi = TestBed.inject(AuthRegisterApi);
    spinnerFacade = TestBed.inject(SpinnerFacade);
  });

  describe('setPendingRegistration', () => {
    it('should dispatch SetPendingRegistration action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.setPendingRegistration('test@example.com');

      expect(dispatchSpy).toHaveBeenCalledWith(new SetPendingRegistration('test@example.com'));
    });
  });

  describe('clearPendingRegistration', () => {
    it('should dispatch ClearPendingRegistration action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.clearPendingRegistration();

      expect(dispatchSpy).toHaveBeenCalledWith(new ClearPendingRegistration());
    });
  });

  describe('register', () => {
    it('should register user and dispatch ClearPendingRegistration and SetAuthenticated actions', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.register('testuser').subscribe((response) => {
        expect(response).toEqual(mockRegisterResponse);
      });

      expect(authRegisterApi.register).toHaveBeenCalledWith('testuser');
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new ClearPendingRegistration());
        expect(dispatchSpy).toHaveBeenCalledWith(new SetAuthenticated(true));
      }, 100);
    });
  });

  describe('loadPendingRegistration', () => {
    it('should load pending registration and dispatch SetPendingRegistration action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.loadPendingRegistration();

      expect(authRegisterApi.getPendingRegistration).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetPendingRegistration('test@example.com'));
      }, 100);
    });

    it('should not dispatch action when email is not present', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      vi.mocked(authRegisterApi.getPendingRegistration).mockReturnValueOnce(of(null));

      facade.loadPendingRegistration();

      expect(authRegisterApi.getPendingRegistration).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).not.toHaveBeenCalledWith(expect.any(SetPendingRegistration));
      }, 100);
    });

    it('should not load pending registration on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthRegisterFacade,
          provideStore([AuthRegisterState]),
          { provide: AuthRegisterApi, useValue: authRegisterApi },
          { provide: SpinnerFacade, useValue: spinnerFacade },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const serverFacade = TestBed.inject(AuthRegisterFacade);
      serverFacade.loadPendingRegistration();

      expect(authRegisterApi.getPendingRegistration).not.toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    it('should expose pendingRegistrationEmail$ selector', () => {
      expect(facade.pendingRegistrationEmail$).toBeDefined();
    });
  });
});
