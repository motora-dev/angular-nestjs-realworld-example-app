import { toCommentDto } from './comment.presenter';

import type { CommentWithAuthor } from '../contracts';

describe('toCommentDto', () => {
  const mockComment: CommentWithAuthor = {
    id: 1,
    body: 'Test comment',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    articleId: 1,
    userId: 1,
    publicId: 'test-public-id',
    user: {
      id: 1,
      username: 'testuser',
      bio: 'Test bio',
      image: 'https://example.com/image.jpg',
    },
  } as CommentWithAuthor;

  it('should convert CommentWithAuthor to CommentDto', () => {
    const isFollowingAuthor = true;

    const result = toCommentDto(mockComment, isFollowingAuthor);

    expect(result).toEqual({
      id: 1,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      body: 'Test comment',
      author: {
        username: 'testuser',
        bio: 'Test bio',
        image: 'https://example.com/image.jpg',
        following: true,
      },
    });
  });

  it('should set author following status to false', () => {
    const result = toCommentDto(mockComment, false);

    expect(result.author.following).toBe(false);
  });

  it('should handle null bio and image', () => {
    const commentWithNullValues = {
      ...mockComment,
      user: {
        ...mockComment.user,
        bio: null,
        image: null,
      },
    };

    const result = toCommentDto(commentWithNullValues, false);

    expect(result.author.bio).toBeNull();
    expect(result.author.image).toBeNull();
  });

  it('should convert dates to ISO string', () => {
    const result = toCommentDto(mockComment, false);

    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2024-01-02T00:00:00.000Z');
  });
});
