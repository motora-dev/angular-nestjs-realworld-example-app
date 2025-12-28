import { toArticleDto } from './article.presenter';

import type { ArticleWithRelations } from '../contracts';

describe('toArticleDto', () => {
  const mockArticle: ArticleWithRelations = {
    id: 1,
    slug: 'test-article-slug',
    title: 'Test Article',
    description: 'Test Description',
    body: 'Test Body',
    tags: ['tag1', 'tag2'],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    userId: 1,
    user: {
      id: 1,
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
    },
    favorites: [],
    _count: {
      favorites: 5,
    },
  };

  it('should convert ArticleWithRelations to ArticleDto', () => {
    const currentUserId = 1;
    const isFollowingAuthor = true;

    const result = toArticleDto(mockArticle, currentUserId, isFollowingAuthor);

    expect(result).toEqual({
      slug: 'test-article-slug',
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['tag1', 'tag2'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      favorited: false,
      favoritesCount: 5,
      author: {
        username: 'testuser',
        bio: 'Test bio',
        image: 'https://example.com/image.jpg',
        following: true,
      },
    });
  });

  it('should set favorited to true when current user has favorited', () => {
    const currentUserId = 1;
    const articleWithFavorite = {
      ...mockArticle,
      favorites: [{ userId: currentUserId }],
    };

    const result = toArticleDto(articleWithFavorite, currentUserId, false);

    expect(result.favorited).toBe(true);
  });

  it('should set favorited to false when current user has not favorited', () => {
    const currentUserId = 1;
    const articleWithoutFavorite = {
      ...mockArticle,
      favorites: [{ userId: 2 }],
    };

    const result = toArticleDto(articleWithoutFavorite, currentUserId, false);

    expect(result.favorited).toBe(false);
  });

  it('should set favorited to false when currentUserId is undefined', () => {
    const result = toArticleDto(mockArticle, undefined, false);

    expect(result.favorited).toBe(false);
  });

  it('should set author following status correctly', () => {
    const result = toArticleDto(mockArticle, 1, true);

    expect(result.author.following).toBe(true);
  });

  it('should handle null bio and image', () => {
    const articleWithNullValues = {
      ...mockArticle,
      user: {
        ...mockArticle.user,
        bio: null,
        image: null,
      },
    };

    const result = toArticleDto(articleWithNullValues, undefined, false);

    expect(result.author.bio).toBeNull();
    expect(result.author.image).toBeNull();
  });

  it('should convert dates to ISO string', () => {
    const result = toArticleDto(mockArticle, undefined, false);

    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2024-01-02T00:00:00.000Z');
  });
});
