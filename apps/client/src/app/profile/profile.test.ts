import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { HomeFacade } from '$domains/home';
import { HomeState } from '$domains/home/store';
import { Profile, ProfileFacade } from '$domains/profile';
import { ProfileState } from '$domains/profile/store';
import { AuthFacade, User } from '$modules/auth';
import { AuthState } from '$modules/auth/store';
import { API_URL } from '$shared/lib';
import { ProfileComponent } from './profile';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockProfileFacade: {
    profile$: BehaviorSubject<Profile | null>;
    loadProfile: ReturnType<typeof vi.fn>;
    follow: ReturnType<typeof vi.fn>;
    unfollow: ReturnType<typeof vi.fn>;
  };
  let mockHomeFacade: {
    articles$: BehaviorSubject<any[]>;
    loadArticles: ReturnType<typeof vi.fn>;
  };
  let mockAuthFacade: {
    currentUser$: BehaviorSubject<User | null>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const mockProfile: Profile = {
    username: 'testuser',
    bio: 'Test Bio',
    image: 'https://example.com/image.jpg',
    following: false,
  };

  const mockUser: User = {
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test Bio',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(async () => {
    mockProfileFacade = {
      profile$: new BehaviorSubject<Profile | null>(null),
      loadProfile: vi.fn(),
      follow: vi.fn(() => of(mockProfile)),
      unfollow: vi.fn(() => of(mockProfile)),
    };

    mockHomeFacade = {
      articles$: new BehaviorSubject<any[]>([]),
      loadArticles: vi.fn(),
    };

    mockAuthFacade = {
      currentUser$: new BehaviorSubject<User | null>(null),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    const mockActivatedRoute = {
      snapshot: {
        params: {
          username: 'testuser',
        },
        firstChild: {
          routeConfig: {
            path: undefined,
          },
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([ProfileState, HomeState, AuthState]),
        { provide: ProfileFacade, useValue: mockProfileFacade },
        { provide: HomeFacade, useValue: mockHomeFacade },
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    })
      .overrideComponent(ProfileComponent, {
        set: {
          providers: [
            { provide: ProfileFacade, useValue: mockProfileFacade },
            { provide: HomeFacade, useValue: mockHomeFacade },
          ],
        },
      })
      .compileComponents();

    // Get actual router instance and spy on navigate
    const router = TestBed.inject(Router);
    mockRouter.navigate = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Skip HTTP mock verification since we're using mocked facades
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadProfile on construction', () => {
    expect(mockProfileFacade.loadProfile).toHaveBeenCalledWith('testuser');
  });

  it('should load articles with posts type on construction', () => {
    expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
      type: 'all',
      filters: { author: 'testuser' },
    });
  });

  describe('favorites route', () => {
    beforeEach(async () => {
      // Reset mocks
      mockProfileFacade = {
        profile$: new BehaviorSubject<Profile | null>(null),
        loadProfile: vi.fn(),
        follow: vi.fn(() => of(mockProfile)),
        unfollow: vi.fn(() => of(mockProfile)),
      };

      mockHomeFacade = {
        articles$: new BehaviorSubject<any[]>([]),
        loadArticles: vi.fn(),
      };

      mockAuthFacade = {
        currentUser$: new BehaviorSubject<User | null>(null),
      };

      mockRouter = {
        navigate: vi.fn(),
      };

      // Mock ActivatedRoute with favorites path
      const mockActivatedRoute = {
        snapshot: {
          params: {
            username: 'testuser',
          },
          firstChild: {
            routeConfig: {
              path: 'favorites',
            },
          },
        },
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ProfileComponent],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
          provideStore([ProfileState, HomeState, AuthState]),
          { provide: ProfileFacade, useValue: mockProfileFacade },
          { provide: HomeFacade, useValue: mockHomeFacade },
          { provide: AuthFacade, useValue: mockAuthFacade },
          { provide: ActivatedRoute, useValue: mockActivatedRoute },
          { provide: API_URL, useValue: 'http://localhost:3000' },
        ],
      })
        .overrideComponent(ProfileComponent, {
          set: {
            providers: [
              { provide: ProfileFacade, useValue: mockProfileFacade },
              { provide: HomeFacade, useValue: mockHomeFacade },
            ],
          },
        })
        .compileComponents();

      const router = TestBed.inject(Router);
      mockRouter.navigate = vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
    });

    it('should set activeTab to favorites when route path is favorites', () => {
      expect(component.activeTab()).toBe('favorites');
    });

    it('should load articles with favorites type when route path is favorites', () => {
      // Should be called twice: once in constructor with 'posts', then with 'favorites'
      expect(mockHomeFacade.loadArticles).toHaveBeenCalledTimes(2);
      expect(mockHomeFacade.loadArticles).toHaveBeenLastCalledWith({
        type: 'all',
        filters: { favorited: 'testuser' },
      });
    });
  });

  describe('isCurrentUser', () => {
    it('should return true when current user matches profile', async () => {
      mockAuthFacade.currentUser$.next(mockUser);
      mockProfileFacade.profile$.next(mockProfile);

      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = component.isCurrentUser(mockProfile);
      expect(result).toBe(true);
    });

    it('should return false when current user does not match profile', async () => {
      const differentUser: User = {
        username: 'otheruser',
        email: 'other@example.com',
        bio: '',
        image: '',
      };
      mockAuthFacade.currentUser$.next(differentUser);
      mockProfileFacade.profile$.next(mockProfile);

      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = component.isCurrentUser(mockProfile);
      expect(result).toBe(false);
    });
  });

  describe('onToggleFollowing', () => {
    it('should call unfollow when profile is following', () => {
      const followingProfile = { ...mockProfile, following: true };
      component.onToggleFollowing(followingProfile);

      expect(mockProfileFacade.unfollow).toHaveBeenCalledWith('testuser');
    });

    it('should call follow when profile is not following', () => {
      component.onToggleFollowing(mockProfile);

      expect(mockProfileFacade.follow).toHaveBeenCalledWith('testuser');
    });
  });

  describe('loadArticles', () => {
    it('should load articles with posts type', () => {
      mockHomeFacade.loadArticles.mockClear();
      component.loadArticles('posts');

      expect(component.activeTab()).toBe('posts');
      expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
        type: 'all',
        filters: { author: 'testuser' },
      });
    });

    it('should load articles with favorites type', () => {
      mockHomeFacade.loadArticles.mockClear();
      component.loadArticles('favorites');

      expect(component.activeTab()).toBe('favorites');
      expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
        type: 'all',
        filters: { favorited: 'testuser' },
      });
    });
  });

  describe('observables', () => {
    it('should expose profile$ from facade', async () => {
      let profile: Profile | null = null;
      component.profile$.subscribe((value) => {
        profile = value;
      });

      expect(profile).toBe(null);

      mockProfileFacade.profile$.next(mockProfile);
      expect(profile).toEqual(mockProfile);
    });

    it('should expose articles$ from homeFacade', async () => {
      let articles: any[] = [];
      component.articles$.subscribe((value) => {
        articles = value;
      });

      expect(articles).toEqual([]);

      mockHomeFacade.articles$.next([{ slug: 'test' }]);
      expect(articles).toEqual([{ slug: 'test' }]);
    });

    it('should expose currentUser$ from authFacade', async () => {
      let user: User | null = null;
      component.currentUser$.subscribe((value) => {
        user = value;
      });

      expect(user).toBe(null);

      mockAuthFacade.currentUser$.next(mockUser);
      expect(user).toEqual(mockUser);
    });
  });
});
