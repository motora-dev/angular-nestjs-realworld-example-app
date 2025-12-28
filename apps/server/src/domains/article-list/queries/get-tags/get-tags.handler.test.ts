import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import { ArticleListService } from '$domains/article-list/services/article-list.service';
import { GetTagsHandler } from './get-tags.handler';

describe('GetTagsHandler', () => {
  let handler: GetTagsHandler;
  let mockService: any;

  const mockTagsDto = {
    tags: ['tag1', 'tag2', 'tag3'],
  };

  beforeEach(async () => {
    mockService = {
      getTags: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTagsHandler,
        {
          provide: ArticleListService,
          useValue: mockService,
        },
      ],
    }).compile();

    handler = module.get<GetTagsHandler>(GetTagsHandler);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle GetTagsQuery', async () => {
    mockService.getTags.mockResolvedValue(mockTagsDto);

    const result = await handler.execute();

    expect(result).toEqual(mockTagsDto);
    expect(mockService.getTags).toHaveBeenCalled();
  });
});
