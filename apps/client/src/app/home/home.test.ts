import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { HomeFacade } from '$domains/home';
import { HomeState } from '$domains/home/store';
import { AuthFacade } from '$modules/auth';
import { AuthState } from '$modules/auth/store';
import { SeoService } from '$modules/seo';
import { API_URL } from '$shared/lib';
import { HomeComponent } from './home';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockHomeFacade: {
    tags$: BehaviorSubject<string[]>;
    articles$: BehaviorSubject<any[]>;
    listConfig$: BehaviorSubject<any>;
    loadTags: ReturnType<typeof vi.fn>;
    loadArticles: ReturnType<typeof vi.fn>;
  };
  let mockAuthFacade: {
    isAuthenticated$: BehaviorSubject<boolean>;
  };
  let mockSeoService: {
    setPageMeta: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockHomeFacade = {
      tags$: new BehaviorSubject<string[]>([]),
      articles$: new BehaviorSubject<any[]>([]),
      listConfig$: new BehaviorSubject<any>({ type: 'all', filters: {} }),
      loadTags: vi.fn(),
      loadArticles: vi.fn(),
    };

    mockAuthFacade = {
      isAuthenticated$: new BehaviorSubject<boolean>(false),
    };

    mockSeoService = {
      setPageMeta: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([HomeState, AuthState]),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: SeoService, useValue: mockSeoService },
        { provide: Router, useValue: mockRouter },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    })
      .overrideComponent(HomeComponent, {
        set: {
          providers: [{ provide: HomeFacade, useValue: mockHomeFacade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Skip HTTP mock verification since we're using mocked facades
    // httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadTags on construction', () => {
    expect(mockHomeFacade.loadTags).toHaveBeenCalled();
  });

  it('should call setPageMeta on construction', () => {
    expect(mockSeoService.setPageMeta).toHaveBeenCalled();
    const callArgs = mockSeoService.setPageMeta.mock.calls[0][0];
    expect(typeof callArgs.title).toBe('string');
    expect(typeof callArgs.description).toBe('string');
    expect(callArgs.type).toBe('website');
    expect(callArgs.url).toBe('/');
  });

  it('should load initial articles with all type on construction', () => {
    expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
      type: 'all',
      filters: {},
    });
  });

  it('should switch to feed when user becomes authenticated', async () => {
    // Reset the mock to track calls after construction
    mockHomeFacade.loadArticles.mockClear();

    // Trigger authentication
    mockAuthFacade.isAuthenticated$.next(true);

    // Wait for async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
      type: 'feed',
      filters: {},
    });
  });

  describe('setListTo', () => {
    it('should load articles with all type', async () => {
      mockHomeFacade.loadArticles.mockClear();
      component.setListTo('all', {});

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
        type: 'all',
        filters: {},
      });
    });

    it('should redirect to login when feed is requested but user is not authenticated', async () => {
      mockAuthFacade.isAuthenticated$.next(false);
      component.setListTo('feed', {});

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should load articles with feed type when user is authenticated', async () => {
      mockAuthFacade.isAuthenticated$.next(true);
      mockHomeFacade.loadArticles.mockClear();

      component.setListTo('feed', {});

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
        type: 'feed',
        filters: {},
      });
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should load articles with filters', async () => {
      const filters = { tag: 'test' };
      mockHomeFacade.loadArticles.mockClear();

      component.setListTo('all', filters);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockHomeFacade.loadArticles).toHaveBeenCalledWith({
        type: 'all',
        filters,
      });
    });
  });

  describe('observables', () => {
    it('should expose tags$ from facade', async () => {
      let tags: string[] = [];
      component.tags$.subscribe((value) => {
        tags = value;
      });

      expect(tags).toEqual([]);

      mockHomeFacade.tags$.next(['tag1', 'tag2']);
      expect(tags).toEqual(['tag1', 'tag2']);
    });

    it('should expose articles$ from facade', async () => {
      let articles: any[] = [];
      component.articles$.subscribe((value) => {
        articles = value;
      });

      expect(articles).toEqual([]);

      mockHomeFacade.articles$.next([{ slug: 'test' }]);
      expect(articles).toEqual([{ slug: 'test' }]);
    });

    it('should expose listConfig$ from facade', async () => {
      let config: any = null;
      component.listConfig$.subscribe((value) => {
        config = value;
      });

      expect(config).toEqual({ type: 'all', filters: {} });
    });

    it('should expose isAuthenticated$ from authFacade', async () => {
      let isAuth: boolean | null = null;
      component.isAuthenticated$.subscribe((value) => {
        isAuth = value ?? false;
      });

      expect(isAuth).toBe(false);

      mockAuthFacade.isAuthenticated$.next(true);
      expect(isAuth).toBe(true);
    });
  });
});
