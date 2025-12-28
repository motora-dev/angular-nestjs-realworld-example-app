import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleEditService } from '$domains/article-edit/services/article-edit.service';
import { DeleteCommentCommand } from './delete-comment.command';
import { DeleteCommentHandler } from './delete-comment.handler';

describe('DeleteCommentHandler', () => {
  let handler: DeleteCommentHandler;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      deleteComment: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCommentHandler,
        {
          provide: ArticleEditService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<DeleteCommentHandler>(DeleteCommentHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle DeleteCommentCommand', async () => {
    const commentId = 1;
    const currentUserId = 1;
    const command = new DeleteCommentCommand(commentId, currentUserId);

    mockService.deleteComment.mockResolvedValue(undefined);

    const result = await handler.execute(command);

    expect(result).toBeUndefined();
    expect(mockService.deleteComment).toHaveBeenCalledWith(commentId, currentUserId);
    expect(mockService.deleteComment).toHaveBeenCalledTimes(1);
  });
});
