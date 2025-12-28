import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it } from 'vitest';

import { Article } from '../model';
import { ClearArticle, SetArticle } from './article.actions';
import { ArticleState } from './article.state';

describe('ArticleState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([ArticleState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have null article as initial state', () => {
      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeNull();
    });
  });

  describe('getArticle selector', () => {
    it('should return null when article is not set', () => {
      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeNull();
    });

    it('should return article when article is set', () => {
      const mockArticle: Article = {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test', 'article'],
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

      store.dispatch(new SetArticle(mockArticle));

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toEqual(mockArticle);
    });
  });

  describe('SetArticle action', () => {
    it('should set article in state', () => {
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

      store.dispatch(new SetArticle(mockArticle));

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toEqual(mockArticle);
    });

    it('should set null article in state', () => {
      const mockArticle: Article = {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: [],
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

      store.dispatch(new SetArticle(mockArticle));
      store.dispatch(new SetArticle(null));

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeNull();
    });
  });

  describe('ClearArticle action', () => {
    it('should clear article from state', () => {
      const mockArticle: Article = {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: [],
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

      store.dispatch(new SetArticle(mockArticle));
      store.dispatch(new ClearArticle());

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeNull();
    });

    it('should clear article even when article is already null', () => {
      store.dispatch(new ClearArticle());

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeNull();
    });
  });
});
