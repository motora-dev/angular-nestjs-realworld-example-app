import { toArticleDto } from './article-list.presenter';

import type { ArticleWithRelations } from '../contracts';

describe('toArticleDto', () => {
  const mockArticle: ArticleWithRelations = {
    id: 1,
    slug: 'test-slug',
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
    favorites: [{ userId: 1 }],
    _count: {
      favorites: 1,
    },
  };

  it('should convert ArticleWithRelations to ArticleDto correctly', () => {
    const currentUserId = 1;
    const isFollowingAuthor = true;

    const result = toArticleDto(mockArticle, currentUserId, isFollowingAuthor);

    expect(result).toEqual({
      slug: 'test-slug',
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['tag1', 'tag2'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      favorited: true,
      favoritesCount: 1,
      author: {
        username: 'testuser',
        bio: 'Test bio',
        image: 'https://example.com/image.jpg',
        following: true,
      },
    });
  });

  it('should set favorited to false if current user has not favorited the article', () => {
    const result = toArticleDto(mockArticle, 999, false); // Different user ID

    expect(result.favorited).toBe(false);
  });

  it('should set favorited to false if current user is not in favorites', () => {
    const articleWithoutFavorite = {
      ...mockArticle,
      favorites: [{ userId: 999, articleId: 1, createdAt: new Date() }],
    };

    const result = toArticleDto(articleWithoutFavorite, 1, false);

    expect(result.favorited).toBe(false);
  });

  it('should set favorited to false when currentUserId is undefined', () => {
    const result = toArticleDto(mockArticle, undefined, false);

    expect(result.favorited).toBe(false);
  });

  it('should set author following status correctly', () => {
    const result = toArticleDto(mockArticle, 1, false);

    expect(result.author.following).toBe(false);
  });

  it('should handle null bio and image for author', () => {
    const articleWithNullValues = {
      ...mockArticle,
      user: {
        ...mockArticle.user,
        bio: null,
        image: null,
      },
    };

    const result = toArticleDto(articleWithNullValues, 1, false);

    expect(result.author.bio).toBeNull();
    expect(result.author.image).toBeNull();
  });

  it('should convert dates to ISO string', () => {
    const result = toArticleDto(mockArticle, 1, false);

    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2024-01-02T00:00:00.000Z');
  });
});
