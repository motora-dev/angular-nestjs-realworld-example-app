import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { ClearPendingRegistration, SetPendingRegistration } from './auth-register.actions';
import { AuthRegisterState } from './auth-register.state';

describe('AuthRegisterState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([AuthRegisterState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have null pendingRegistrationEmail as initial state', () => {
      const email = store.selectSnapshot(AuthRegisterState.pendingRegistrationEmail);
      expect(email).toBeNull();
    });
  });

  describe('pendingRegistrationEmail selector', () => {
    it('should return null when pending registration email is not set', () => {
      const email = store.selectSnapshot(AuthRegisterState.pendingRegistrationEmail);
      expect(email).toBeNull();
    });

    it('should return email when pending registration email is set', () => {
      store.dispatch(new SetPendingRegistration('test@example.com'));

      const email = store.selectSnapshot(AuthRegisterState.pendingRegistrationEmail);
      expect(email).toBe('test@example.com');
    });
  });

  describe('SetPendingRegistration action', () => {
    it('should set pending registration email in state', () => {
      store.dispatch(new SetPendingRegistration('test@example.com'));

      const email = store.selectSnapshot(AuthRegisterState.pendingRegistrationEmail);
      expect(email).toBe('test@example.com');
    });

    it('should update pending registration email in state', () => {
      store.dispatch(new SetPendingRegistration('test1@example.com'));
      store.dispatch(new SetPendingRegistration('test2@example.com'));

      const email = store.selectSnapshot(AuthRegisterState.pendingRegistrationEmail);
      expect(email).toBe('test2@example.com');
    });
  });

  describe('ClearPendingRegistration action', () => {
    it('should clear pending registration email from state', () => {
      store.dispatch(new SetPendingRegistration('test@example.com'));
      store.dispatch(new ClearPendingRegistration());

      const email = store.selectSnapshot(AuthRegisterState.pendingRegistrationEmail);
      expect(email).toBeNull();
    });
  });
});
