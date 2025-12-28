import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { GetCommentsHandler } from './get-comments.handler';
import { GetCommentsQuery } from './get-comments.query';
import { ArticleService } from '../../services/article.service';

describe('GetCommentsHandler', () => {
  let handler: GetCommentsHandler;
  let mockService: any;

  const mockMultipleCommentsDto = {
    comments: [
      {
        id: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        body: 'Test comment',
        author: {
          username: 'testuser',
          bio: null,
          image: null,
          following: false,
        },
      },
    ],
  };

  beforeEach(async () => {
    mockService = {
      getComments: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCommentsHandler,
        {
          provide: ArticleService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetCommentsHandler>(GetCommentsHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetCommentsQuery', async () => {
    const slug = 'test-article-slug';
    const currentUserId = 1;
    const query = new GetCommentsQuery(slug, currentUserId);

    mockService.getComments.mockResolvedValue(mockMultipleCommentsDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockMultipleCommentsDto);
    expect(mockService.getComments).toHaveBeenCalledWith(slug, currentUserId);
    expect(mockService.getComments).toHaveBeenCalledTimes(1);
  });

  it('should handle GetCommentsQuery without currentUserId', async () => {
    const slug = 'test-article-slug';
    const query = new GetCommentsQuery(slug);

    mockService.getComments.mockResolvedValue(mockMultipleCommentsDto);

    const result = await handler.execute(query);

    expect(result).toEqual(mockMultipleCommentsDto);
    expect(mockService.getComments).toHaveBeenCalledWith(slug, undefined);
    expect(mockService.getComments).toHaveBeenCalledTimes(1);
  });
});
