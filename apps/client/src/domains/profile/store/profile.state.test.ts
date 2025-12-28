import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { ClearProfile, SetProfile } from './profile.actions';
import { Profile } from '../model';
import { ProfileState } from './profile.state';

describe('ProfileState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([ProfileState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have null profile as initial state', () => {
      const profile = store.selectSnapshot(ProfileState.getProfile);
      expect(profile).toBeNull();
    });
  });

  describe('getProfile selector', () => {
    it('should return null when profile is not set', () => {
      const profile = store.selectSnapshot(ProfileState.getProfile);
      expect(profile).toBeNull();
    });

    it('should return profile when profile is set', () => {
      const mockProfile: Profile = {
        username: 'testuser',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
        following: false,
      };

      store.dispatch(new SetProfile(mockProfile));

      const profile = store.selectSnapshot(ProfileState.getProfile);
      expect(profile).toEqual(mockProfile);
    });
  });

  describe('SetProfile action', () => {
    it('should set profile in state', () => {
      const mockProfile: Profile = {
        username: 'testuser',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
        following: false,
      };

      store.dispatch(new SetProfile(mockProfile));

      const profile = store.selectSnapshot(ProfileState.getProfile);
      expect(profile).toEqual(mockProfile);
    });

    it('should update profile in state', () => {
      const initialProfile: Profile = {
        username: 'testuser',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
        following: false,
      };

      const updatedProfile: Profile = {
        username: 'testuser',
        bio: 'Updated Bio',
        image: 'https://example.com/new-image.jpg',
        following: true,
      };

      store.dispatch(new SetProfile(initialProfile));
      store.dispatch(new SetProfile(updatedProfile));

      const profile = store.selectSnapshot(ProfileState.getProfile);
      expect(profile).toEqual(updatedProfile);
    });
  });

  describe('ClearProfile action', () => {
    it('should clear profile from state', () => {
      const mockProfile: Profile = {
        username: 'testuser',
        bio: 'Test Bio',
        image: 'https://example.com/image.jpg',
        following: false,
      };

      store.dispatch(new SetProfile(mockProfile));
      store.dispatch(new ClearProfile());

      const profile = store.selectSnapshot(ProfileState.getProfile);
      expect(profile).toBeNull();
    });
  });
});
