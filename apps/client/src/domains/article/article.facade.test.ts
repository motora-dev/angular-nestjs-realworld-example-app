import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { SeoService } from '$modules/seo';
import { SpinnerFacade } from '$modules/spinner';
import { ArticleApi, ArticleResponse, CommentResponse, CommentsApi } from './api';
import { ArticleFacade } from './article.facade';
import { Article, Comment } from './model';
import { AddComment, ArticleState, CommentsState, SetArticle, SetComments } from './store';

describe('ArticleFacade', () => {
  let facade: ArticleFacade;
  let store: Store;
  let articleApi: ArticleApi;
  let commentsApi: CommentsApi;
  let router: Router;
  let seoService: SeoService;
  let spinnerFacade: SpinnerFacade;

  const mockArticleResponse: ArticleResponse = {
    slug: 'test-slug',
    title: 'Test Article',
    description: 'Test Description',
    body: 'Test Body',
    tagList: ['test', 'article'],
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
  };

  const mockCommentResponse: CommentResponse = {
    id: '1',
    body: 'Test Comment',
    createdAt: '2024-01-01T00:00:00.000Z',
    author: {
      username: 'commenter',
      bio: '',
      image: '',
      following: false,
    },
  };

  beforeEach(() => {
    const mockArticleApi = {
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      favorite: vi.fn(),
      unfavorite: vi.fn(),
    };

    const mockCommentsApi = {
      getAll: vi.fn(),
      add: vi.fn(),
      delete: vi.fn(),
    };

    const mockRouter = {
      navigate: vi.fn(),
    };

    const mockSeoService = {
      setPageMeta: vi.fn(),
    };

    const mockSpinnerFacade = {
      withSpinner: vi.fn(() => (source: any) => source),
    };

    TestBed.configureTestingModule({
      providers: [
        ArticleFacade,
        provideStore([ArticleState, CommentsState]),
        { provide: ArticleApi, useValue: mockArticleApi },
        { provide: CommentsApi, useValue: mockCommentsApi },
        { provide: Router, useValue: mockRouter },
        { provide: SeoService, useValue: mockSeoService },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
      ],
    });

    facade = TestBed.inject(ArticleFacade);
    store = TestBed.inject(Store);
    articleApi = TestBed.inject(ArticleApi);
    commentsApi = TestBed.inject(CommentsApi);
    router = TestBed.inject(Router);
    seoService = TestBed.inject(SeoService);
    spinnerFacade = TestBed.inject(SpinnerFacade);
  });

  describe('selectors', () => {
    it('should select article from state', async () => {
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

      const article = await new Promise<Article | null>((resolve) => {
        facade.article$.subscribe((a) => resolve(a));
      });

      expect(article).toEqual(mockArticle);
    });

    it('should select comments from state', async () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          body: 'Comment 1',
          createdAt: new Date('2024-01-01'),
          author: {
            username: 'user1',
            bio: '',
            image: '',
            following: false,
          },
        },
      ];

      store.dispatch(new SetComments(mockComments));

      const comments = await new Promise<Comment[]>((resolve) => {
        facade.comments$.subscribe((c) => resolve(c));
      });

      expect(comments).toEqual(mockComments);
    });

    it('should select isCommentFormInvalid from state', async () => {
      const isInvalid = await new Promise<boolean>((resolve) => {
        facade.isCommentFormInvalid$.subscribe((invalid) => resolve(invalid));
      });

      expect(isInvalid).toBe(true);
    });
  });

  describe('loadArticle', () => {
    it('should load article, dispatch to store, and set SEO metadata', async () => {
      vi.mocked(articleApi.get).mockReturnValue(of(mockArticleResponse));

      facade.loadArticle('test-slug');

      expect(articleApi.get).toHaveBeenCalledWith('test-slug');
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeTruthy();
      expect(article?.slug).toBe('test-slug');
      expect(article?.title).toBe('Test Article');
      expect(seoService.setPageMeta).toHaveBeenCalledWith({
        title: 'Test Article',
        description: 'Test Description',
        type: 'article',
        url: '/article/test-slug',
        tags: ['test', 'article'],
      });
    });
  });

  describe('deleteArticle', () => {
    it('should delete article, clear state, and navigate to home', async () => {
      vi.mocked(articleApi.delete).mockReturnValue(of(undefined));

      await new Promise<void>((resolve) => {
        facade.deleteArticle('test-slug').subscribe(() => {
          expect(articleApi.delete).toHaveBeenCalledWith('test-slug');
          expect(spinnerFacade.withSpinner).toHaveBeenCalled();
          resolve();
        });
      });

      // Wait for tap operator to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('favoriteArticle', () => {
    it('should favorite article and update state', async () => {
      const favoritedResponse: ArticleResponse = {
        ...mockArticleResponse,
        favorited: true,
        favoritesCount: 1,
      };

      vi.mocked(articleApi.favorite).mockReturnValue(of(favoritedResponse));

      const article = await new Promise<Article>((resolve) => {
        facade.favoriteArticle('test-slug').subscribe((a) => resolve(a));
      });

      expect(articleApi.favorite).toHaveBeenCalledWith('test-slug');
      expect(article.favorited).toBe(true);
      expect(article.favoritesCount).toBe(1);

      // Wait for tap operator to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stateArticle = store.selectSnapshot(ArticleState.getArticle);
      expect(stateArticle?.favorited).toBe(true);
      expect(stateArticle?.favoritesCount).toBe(1);
    });
  });

  describe('unfavoriteArticle', () => {
    it('should unfavorite article', async () => {
      vi.mocked(articleApi.unfavorite).mockReturnValue(of(undefined));

      await new Promise<void>((resolve) => {
        facade.unfavoriteArticle('test-slug').subscribe(() => {
          expect(articleApi.unfavorite).toHaveBeenCalledWith('test-slug');
          resolve();
        });
      });
    });
  });

  describe('clearArticle', () => {
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
      facade.clearArticle();

      const article = store.selectSnapshot(ArticleState.getArticle);
      expect(article).toBeNull();
    });
  });

  describe('loadComments', () => {
    it('should load comments and dispatch to store', async () => {
      const mockCommentsResponse: CommentResponse[] = [mockCommentResponse];

      vi.mocked(commentsApi.getAll).mockReturnValue(of(mockCommentsResponse));

      facade.loadComments('test-slug');

      expect(commentsApi.getAll).toHaveBeenCalledWith('test-slug');

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('1');
      expect(comments[0].body).toBe('Test Comment');
    });
  });

  describe('addComment', () => {
    it('should add comment, update state, and clear form', async () => {
      vi.mocked(commentsApi.add).mockReturnValue(of(mockCommentResponse));

      const comment = await new Promise<Comment>((resolve) => {
        facade.addComment('test-slug', 'New Comment').subscribe((c) => resolve(c));
      });

      expect(commentsApi.add).toHaveBeenCalledWith('test-slug', 'New Comment');
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();
      expect(comment.id).toBe('1');
      expect(comment.body).toBe('Test Comment');

      // Wait for tap operator to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toBe('1');
    });
  });

  describe('deleteComment', () => {
    it('should delete comment and remove from state', async () => {
      const existingComment: Comment = {
        id: '1',
        body: 'Existing Comment',
        createdAt: new Date('2024-01-01'),
        author: {
          username: 'user1',
          bio: '',
          image: '',
          following: false,
        },
      };

      store.dispatch(new AddComment(existingComment));

      vi.mocked(commentsApi.delete).mockReturnValue(of(undefined));

      await new Promise<void>((resolve) => {
        facade.deleteComment('1', 'test-slug').subscribe(() => {
          expect(commentsApi.delete).toHaveBeenCalledWith('1', 'test-slug');
          expect(spinnerFacade.withSpinner).toHaveBeenCalled();
          resolve();
        });
      });

      // Wait for tap operator to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toHaveLength(0);
    });
  });

  describe('clearComments', () => {
    it('should clear comments from state', () => {
      const mockComments: Comment[] = [
        {
          id: '1',
          body: 'Comment',
          createdAt: new Date('2024-01-01'),
          author: {
            username: 'user1',
            bio: '',
            image: '',
            following: false,
          },
        },
      ];

      store.dispatch(new SetComments(mockComments));
      facade.clearComments();

      const comments = store.selectSnapshot(CommentsState.getComments);
      expect(comments).toEqual([]);
    });
  });

  describe('clearCommentForm', () => {
    it('should clear comment form from state', () => {
      facade.clearCommentForm();

      // Form state is reset to default (invalid)
      const isInvalid = store.selectSnapshot(CommentsState.isCommentFormInvalid);
      expect(isInvalid).toBe(true);
    });
  });
});
