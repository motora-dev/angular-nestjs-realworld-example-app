import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { Article } from '$domains/article';
import { SetArticles, SetListConfig, SetTags } from './home.actions';
import { HomeState } from './home.state';

describe('HomeState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([HomeState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have empty tags as initial state', () => {
      const tags = store.selectSnapshot(HomeState.getTags);
      expect(tags).toEqual([]);
    });

    it('should have empty articles as initial state', () => {
      const articles = store.selectSnapshot(HomeState.getArticles);
      expect(articles).toEqual([]);
    });

    it('should have zero articlesCount as initial state', () => {
      const articlesCount = store.selectSnapshot(HomeState.getArticlesCount);
      expect(articlesCount).toBe(0);
    });

    it('should have default listConfig as initial state', () => {
      const listConfig = store.selectSnapshot(HomeState.getListConfig);
      expect(listConfig).toEqual({ type: 'all', filters: {} });
    });
  });

  describe('getTags selector', () => {
    it('should return tags from state', () => {
      const tags = ['tag1', 'tag2'];
      store.dispatch(new SetTags(tags));

      const result = store.selectSnapshot(HomeState.getTags);
      expect(result).toEqual(tags);
    });
  });

  describe('getArticles selector', () => {
    it('should return articles from state', () => {
      const mockArticle: Article = {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: 'Test Bio',
          image: 'https://example.com/image.jpg',
          following: false,
        },
      };

      store.dispatch(new SetArticles([mockArticle], 1));

      const articles = store.selectSnapshot(HomeState.getArticles);
      expect(articles).toEqual([mockArticle]);
    });
  });

  describe('getArticlesCount selector', () => {
    it('should return articlesCount from state', () => {
      const mockArticle: Article = {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: '',
          image: '',
          following: false,
        },
      };

      store.dispatch(new SetArticles([mockArticle], 5));

      const articlesCount = store.selectSnapshot(HomeState.getArticlesCount);
      expect(articlesCount).toBe(5);
    });
  });

  describe('getListConfig selector', () => {
    it('should return listConfig from state', () => {
      const config = { type: 'feed' as const, filters: { author: 'testuser' } };
      store.dispatch(new SetListConfig(config));

      const result = store.selectSnapshot(HomeState.getListConfig);
      expect(result).toEqual(config);
    });
  });

  describe('SetTags action', () => {
    it('should set tags in state', () => {
      const tags = ['tag1', 'tag2', 'tag3'];
      store.dispatch(new SetTags(tags));

      const result = store.selectSnapshot(HomeState.getTags);
      expect(result).toEqual(tags);
    });
  });

  describe('SetArticles action', () => {
    it('should set articles and articlesCount in state', () => {
      const mockArticle: Article = {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: '',
          image: '',
          following: false,
        },
      };

      store.dispatch(new SetArticles([mockArticle], 10));

      const articles = store.selectSnapshot(HomeState.getArticles);
      const articlesCount = store.selectSnapshot(HomeState.getArticlesCount);
      expect(articles).toEqual([mockArticle]);
      expect(articlesCount).toBe(10);
    });
  });

  describe('SetListConfig action', () => {
    it('should set listConfig in state', () => {
      const config = { type: 'all' as const, filters: { tag: 'test' } };
      store.dispatch(new SetListConfig(config));

      const result = store.selectSnapshot(HomeState.getListConfig);
      expect(result).toEqual(config);
    });
  });
});
