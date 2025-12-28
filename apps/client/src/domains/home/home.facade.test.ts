import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SpinnerFacade } from '$modules/spinner';
import { HomeApi, ArticlesResponse, TagsResponse } from './api';
import { HomeFacade } from './home.facade';
import { HomeState, SetArticles, SetListConfig, SetTags } from './store';

describe('HomeFacade', () => {
  let facade: HomeFacade;
  let store: Store;
  let homeApi: HomeApi;
  let spinnerFacade: SpinnerFacade;

  const mockTagsResponse: TagsResponse = {
    tags: ['tag1', 'tag2', 'tag3'],
  };

  const mockArticlesResponse: ArticlesResponse = {
    articles: [
      {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
          following: false,
        },
      },
    ],
    articlesCount: 1,
  };

  beforeEach(() => {
    const mockHomeApi = {
      getTags: vi.fn(() => of(mockTagsResponse)),
      getArticles: vi.fn(() => of(mockArticlesResponse)),
    };

    const mockSpinnerFacade = {
      withSpinner: vi.fn(() => (source: any) => source),
    };

    TestBed.configureTestingModule({
      providers: [
        HomeFacade,
        provideStore([HomeState]),
        { provide: HomeApi, useValue: mockHomeApi },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
      ],
    });

    facade = TestBed.inject(HomeFacade);
    store = TestBed.inject(Store);
    homeApi = TestBed.inject(HomeApi);
    spinnerFacade = TestBed.inject(SpinnerFacade);
  });

  describe('loadTags', () => {
    it('should load tags and dispatch SetTags action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.loadTags();

      expect(homeApi.getTags).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(new SetTags(mockTagsResponse.tags));
    });
  });

  describe('loadArticles', () => {
    it('should load articles and dispatch SetListConfig and SetArticles actions', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const config = { type: 'all' as const, filters: {} };

      facade.loadArticles(config);

      expect(dispatchSpy).toHaveBeenCalledWith(new SetListConfig(config));
      expect(homeApi.getArticles).toHaveBeenCalledWith(config);
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();

      // Wait for async operations
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            articles: expect.arrayContaining([
              expect.objectContaining({
                slug: 'test-slug',
                title: 'Test Article',
              }),
            ]),
            articlesCount: 1,
          }),
        );
      }, 100);
    });

    it('should map article responses correctly', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      const config = { type: 'all' as const, filters: {} };

      facade.loadArticles(config);

      setTimeout(() => {
        const setArticlesCall = dispatchSpy.mock.calls.find((call) => call[0] instanceof SetArticles);
        expect(setArticlesCall).toBeDefined();
        if (setArticlesCall) {
          const action = setArticlesCall[0] as SetArticles;
          expect(action.articles[0].createdAt).toBeInstanceOf(Date);
          expect(action.articles[0].updatedAt).toBeInstanceOf(Date);
        }
      }, 100);
    });
  });

  describe('setListConfig', () => {
    it('should call loadArticles with the config', () => {
      const loadArticlesSpy = vi.spyOn(facade, 'loadArticles');
      const config = { type: 'feed' as const, filters: {} };

      facade.setListConfig(config);

      expect(loadArticlesSpy).toHaveBeenCalledWith(config);
    });
  });

  describe('selectors', () => {
    it('should expose tags$ selector', () => {
      expect(facade.tags$).toBeDefined();
    });

    it('should expose articles$ selector', () => {
      expect(facade.articles$).toBeDefined();
    });

    it('should expose articlesCount$ selector', () => {
      expect(facade.articlesCount$).toBeDefined();
    });

    it('should expose listConfig$ selector', () => {
      expect(facade.listConfig$).toBeDefined();
    });
  });
});
