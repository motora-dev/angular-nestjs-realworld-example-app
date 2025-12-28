import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { User } from '../model';
import { SetAuthenticated, SetCurrentUser } from './auth.actions';
import { AuthState } from './auth.state';

describe('AuthState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([AuthState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have null isAuthenticated as initial state', () => {
      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
      expect(isAuthenticated).toBeNull();
    });

    it('should have null currentUser as initial state', () => {
      const currentUser = store.selectSnapshot(AuthState.currentUser);
      expect(currentUser).toBeNull();
    });
  });

  describe('isAuthenticated selector', () => {
    it('should return null when not set', () => {
      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
      expect(isAuthenticated).toBeNull();
    });

    it('should return true when authenticated', () => {
      store.dispatch(new SetAuthenticated(true));

      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
      expect(isAuthenticated).toBe(true);
    });

    it('should return false when not authenticated', () => {
      store.dispatch(new SetAuthenticated(false));

      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('currentUser selector', () => {
    it('should return null when not set', () => {
      const currentUser = store.selectSnapshot(AuthState.currentUser);
      expect(currentUser).toBeNull();
    });

    it('should return user when set', () => {
      const mockUser: User = {
        email: 'test@example.com',
        username: 'testuser',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      store.dispatch(new SetCurrentUser(mockUser));

      const currentUser = store.selectSnapshot(AuthState.currentUser);
      expect(currentUser).toEqual(mockUser);
    });
  });

  describe('SetAuthenticated action', () => {
    it('should set isAuthenticated in state', () => {
      store.dispatch(new SetAuthenticated(true));

      const isAuthenticated = store.selectSnapshot(AuthState.isAuthenticated);
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('SetCurrentUser action', () => {
    it('should set currentUser in state', () => {
      const mockUser: User = {
        email: 'test@example.com',
        username: 'testuser',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      store.dispatch(new SetCurrentUser(mockUser));

      const currentUser = store.selectSnapshot(AuthState.currentUser);
      expect(currentUser).toEqual(mockUser);
    });

    it('should set currentUser to null', () => {
      const mockUser: User = {
        email: 'test@example.com',
        username: 'testuser',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
      };

      store.dispatch(new SetCurrentUser(mockUser));
      store.dispatch(new SetCurrentUser(null));

      const currentUser = store.selectSnapshot(AuthState.currentUser);
      expect(currentUser).toBeNull();
    });
  });
});
