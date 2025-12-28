import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SpinnerFacade } from '$modules/spinner';
import { ProfileApi } from './api';
import { Profile } from './model';
import { ProfileFacade } from './profile.facade';
import { ClearProfile, ProfileState, SetProfile } from './store';

describe('ProfileFacade', () => {
  let facade: ProfileFacade;
  let store: Store;
  let profileApi: ProfileApi;
  let spinnerFacade: SpinnerFacade;

  const mockProfile: Profile = {
    username: 'testuser',
    bio: 'Test Bio',
    image: 'https://example.com/image.jpg',
    following: false,
  };

  beforeEach(() => {
    const mockProfileApi = {
      get: vi.fn(() => of(mockProfile)),
      follow: vi.fn(() => of({ ...mockProfile, following: true })),
      unfollow: vi.fn(() => of({ ...mockProfile, following: false })),
    };

    const mockSpinnerFacade = {
      withSpinner: vi.fn(() => (source: any) => source),
    };

    TestBed.configureTestingModule({
      providers: [
        ProfileFacade,
        provideStore([ProfileState]),
        { provide: ProfileApi, useValue: mockProfileApi },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
      ],
    });

    facade = TestBed.inject(ProfileFacade);
    store = TestBed.inject(Store);
    profileApi = TestBed.inject(ProfileApi);
    spinnerFacade = TestBed.inject(SpinnerFacade);
  });

  describe('loadProfile', () => {
    it('should load profile and dispatch SetProfile action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.loadProfile('testuser');

      expect(profileApi.get).toHaveBeenCalledWith('testuser');
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();

      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetProfile(mockProfile));
      }, 100);
    });
  });

  describe('follow', () => {
    it('should follow user and dispatch SetProfile action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const updatedProfile = { ...mockProfile, following: true };

      facade.follow('testuser').subscribe((profile) => {
        expect(profile).toEqual(updatedProfile);
      });

      expect(profileApi.follow).toHaveBeenCalledWith('testuser');
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetProfile(updatedProfile));
      }, 100);
    });
  });

  describe('unfollow', () => {
    it('should unfollow user and dispatch SetProfile action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const updatedProfile = { ...mockProfile, following: false };

      facade.unfollow('testuser').subscribe((profile) => {
        expect(profile).toEqual(updatedProfile);
      });

      expect(profileApi.unfollow).toHaveBeenCalledWith('testuser');
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(new SetProfile(updatedProfile));
      }, 100);
    });
  });

  describe('clearProfile', () => {
    it('should dispatch ClearProfile action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.clearProfile();

      expect(dispatchSpy).toHaveBeenCalledWith(new ClearProfile());
    });
  });

  describe('selectors', () => {
    it('should expose profile$ selector', () => {
      expect(facade.profile$).toBeDefined();
    });
  });
});
