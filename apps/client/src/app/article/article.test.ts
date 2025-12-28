import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { EMPTY, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { Article, ArticleFacade, Comment } from '$domains/article';
import { ArticleApi } from '$domains/article/api';
import { ArticleState, CommentsState } from '$domains/article/store';
import { AuthFacade, User } from '$modules/auth';
import { AuthState } from '$modules/auth/store';
import { SeoService } from '$modules/seo';
import { SpinnerFacade } from '$modules/spinner';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { ArticleComponent } from './article';

describe('ArticleComponent', () => {
  let component: ArticleComponent;
  let fixture: ComponentFixture<ArticleComponent>;
  let httpMock: HttpTestingController;

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

  const mockUser: User = {
    username: 'testuser',
    email: 'test@example.com',
    bio: 'Test Bio',
    image: 'https://example.com/image.jpg',
  };

  const mockComment: Comment = {
    id: '1',
    body: 'Test Comment',
    createdAt: new Date('2024-01-01'),
    author: {
      username: 'commenter',
      bio: '',
      image: '',
      following: false,
    },
  };

  beforeEach(async () => {
    const mockAuthFacade = {
      isAuthenticated$: of(true),
      currentUser$: of(mockUser),
    };

    const mockRouter = {
      navigate: vi.fn(),
      createUrlTree: vi.fn((_commands: any[]) => ({})),
      serializeUrl: vi.fn((_urlTree: any) => '/'),
      events: EMPTY, // RouterLinkがsubscribeするためのObservable
    };

    const mockActivatedRoute = {
      snapshot: {
        params: {
          slug: 'test-slug',
        },
      },
    };

    const mockSeoService = {
      setPageMeta: vi.fn(),
    };

    const mockSpinnerFacade = {
      withSpinner: vi.fn(() => (source: any) => source),
    };

    await TestBed.configureTestingModule({
      imports: [ArticleComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([ArticleState, CommentsState, AuthState, SpinnerState]),
        ArticleFacade,
        ArticleApi,
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: SeoService, useValue: mockSeoService },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    // 初期化時のHTTPリクエストをモック
    const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
    articleReq.flush({
      article: {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: '',
          image: '',
          following: false,
        },
      },
    });
    const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
    commentsReq.flush({ comments: [] });

    expect(component).toBeTruthy();
  });

  it('should load article and comments on initialization', () => {
    // HTTPリクエストが送信されることを確認
    const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
    expect(articleReq.request.method).toBe('GET');
    articleReq.flush({
      article: {
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
      },
    });

    const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
    expect(commentsReq.request.method).toBe('GET');
    commentsReq.flush({
      comments: [
        {
          id: '1',
          body: 'Test Comment',
          createdAt: '2024-01-01T00:00:00.000Z',
          author: {
            username: 'commenter',
            bio: '',
            image: '',
            following: false,
          },
        },
      ],
    });
  });

  it('should subscribe to article$ from facade', async () => {
    // 初期化時のHTTPリクエストをモック
    const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
    articleReq.flush({
      article: {
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
      },
    });

    const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
    commentsReq.flush({ comments: [] });

    // 非同期処理を待つ
    await new Promise((resolve) => setTimeout(resolve, 100));

    const article = await new Promise<Article | null>((resolve) => {
      component.article$.subscribe((a) => resolve(a));
    });
    expect(article).toBeTruthy();
    expect(article?.slug).toBe('test-slug');
  });

  it('should subscribe to comments$ from facade', async () => {
    // 初期化時のHTTPリクエストをモック
    const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
    articleReq.flush({
      article: {
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
      },
    });

    const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
    commentsReq.flush({
      comments: [
        {
          id: '1',
          body: 'Test Comment',
          createdAt: '2024-01-01T00:00:00.000Z',
          author: {
            username: 'commenter',
            bio: '',
            image: '',
            following: false,
          },
        },
      ],
    });

    // 非同期処理を待つ
    await new Promise((resolve) => setTimeout(resolve, 100));

    const comments = await new Promise<Comment[]>((resolve) => {
      component.comments$.subscribe((c) => resolve(c));
    });
    expect(comments).toHaveLength(1);
    expect(comments[0].id).toBe('1');
  });

  it('should subscribe to isAuthenticated$ from auth facade', async () => {
    // 初期化時のHTTPリクエストをモック
    const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
    articleReq.flush({
      article: {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: '',
          image: '',
          following: false,
        },
      },
    });
    const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
    commentsReq.flush({ comments: [] });

    const isAuth = await new Promise<boolean | null>((resolve) => {
      component.isAuthenticated$.subscribe((auth) => resolve(auth));
    });
    expect(isAuth).toBe(true);
  });

  it('should subscribe to currentUser$ from auth facade', async () => {
    // 初期化時のHTTPリクエストをモック
    const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
    articleReq.flush({
      article: {
        slug: 'test-slug',
        title: 'Test Article',
        description: 'Test Description',
        body: 'Test Body',
        tagList: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favorited: false,
        favoritesCount: 0,
        author: {
          username: 'testuser',
          bio: '',
          image: '',
          following: false,
        },
      },
    });
    const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
    commentsReq.flush({ comments: [] });

    const user = await new Promise<User | null>((resolve) => {
      component.currentUser$.subscribe((u) => resolve(u));
    });
    expect(user).toEqual(mockUser);
  });

  describe('canModify', () => {
    it('should return true when current user is the article author', async () => {
      // 初期化時のHTTPリクエストをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = component.canModify(mockArticle, mockUser);
      expect(result).toBe(true);
    });

    it('should return false when current user is not the article author', async () => {
      // 初期化時のHTTPリクエストをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const differentUser: User = {
        username: 'otheruser',
        email: 'other@example.com',
        bio: '',
        image: '',
      };
      const result = component.canModify(mockArticle, differentUser);
      expect(result).toBe(false);
    });

    it('should return false when current user is null', async () => {
      // 初期化時のHTTPリクエストをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = component.canModify(mockArticle, null);
      expect(result).toBe(false);
    });
  });

  describe('onToggleFavorite', () => {
    it('should call unfavoriteArticle when article is favorited', async () => {
      // 初期の記事読み込みをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: {
          ...mockArticle,
          favorited: true,
        },
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const favoritedArticle: Article = {
        ...mockArticle,
        favorited: true,
      };
      component.onToggleFavorite(favoritedArticle);

      const unfavoriteReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/favorite');
      expect(unfavoriteReq.request.method).toBe('DELETE');
      unfavoriteReq.flush(null);
    });

    it('should call favoriteArticle when article is not favorited', async () => {
      // 初期の記事読み込みをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      component.onToggleFavorite(mockArticle);

      const favoriteReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/favorite');
      expect(favoriteReq.request.method).toBe('POST');
      favoriteReq.flush({
        article: {
          ...mockArticle,
          favorited: true,
          favoritesCount: 1,
        },
      });
    });
  });

  describe('deleteArticle', () => {
    it('should set isDeleting to true and call facade deleteArticle', async () => {
      // 初期の記事読み込みをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      component.deleteArticle('test-slug');

      expect(component.isDeleting()).toBe(true);

      const deleteReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);
    });
  });

  describe('addComment', () => {
    it('should call facade addComment with slug and body', async () => {
      // 初期の記事読み込みをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      component.addComment('test-slug', 'New Comment');

      const addCommentReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      expect(addCommentReq.request.method).toBe('POST');
      expect(addCommentReq.request.body).toEqual({ comment: { body: 'New Comment' } });
      addCommentReq.flush({
        comment: {
          id: '2',
          body: 'New Comment',
          createdAt: '2024-01-02T00:00:00.000Z',
          author: {
            username: 'testuser',
            bio: '',
            image: '',
            following: false,
          },
        },
      });
    });
  });

  describe('deleteComment', () => {
    it('should call facade deleteComment with comment id and slug', async () => {
      // 初期の記事読み込みをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({
        comments: [mockComment],
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      component.deleteComment(mockComment, 'test-slug');

      const deleteCommentReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments/1');
      expect(deleteCommentReq.request.method).toBe('DELETE');
      deleteCommentReq.flush(null);
    });
  });

  describe('toggleFollowing', () => {
    it('should be a no-op method', async () => {
      // 初期化時のHTTPリクエストをモック
      const articleReq = httpMock.expectOne('http://localhost:3000/articles/test-slug');
      articleReq.flush({
        article: mockArticle,
      });
      const commentsReq = httpMock.expectOne('http://localhost:3000/articles/test-slug/comments');
      commentsReq.flush({ comments: [] });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const profile = mockArticle.author;
      expect(() => component.toggleFollowing(profile)).not.toThrow();
    });
  });
});
