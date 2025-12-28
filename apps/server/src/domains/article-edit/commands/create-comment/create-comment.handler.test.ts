import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { CreateCommentCommand } from './create-comment.command';
import { CreateCommentHandler } from './create-comment.handler';

describe('CreateCommentHandler', () => {
  let handler: CreateCommentHandler;
  let mockService: any;

  const mockRequest = {
    comment: {
      body: 'Test comment body',
    },
  };

  beforeEach(async () => {
    mockService = {
      createComment: vi.fn(),
      isFollowing: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommentHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<CreateCommentHandler>(CreateCommentHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle CreateCommentCommand', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const command = new CreateCommentCommand(slug, mockRequest, currentUserId);

    const mockComment = {
      id: 1,
      body: 'Test comment body',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      articleId: 1,
      userId: currentUserId,
      publicId: 'test-public-id',
      user: {
        id: currentUserId,
        username: 'testuser',
        bio: null,
        image: null,
      },
    };

    mockService.createComment.mockResolvedValue(mockComment);
    mockService.isFollowing.mockResolvedValue(false);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('comment');
    expect(result.comment).toHaveProperty('id', 1);
    expect(result.comment).toHaveProperty('body', 'Test comment body');
    expect(result.comment.author).toHaveProperty('username', 'testuser');
    expect(result.comment.author).toHaveProperty('following', false);
    expect(mockService.createComment).toHaveBeenCalledWith(slug, mockRequest, currentUserId);
    expect(mockService.isFollowing).toHaveBeenCalledWith(currentUserId, mockComment.user.id);
  });
});
