import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';

import type { CurrentUserType } from '$decorators';
import { GoogleAuthGuard } from '$modules/auth/guards';
import { ArticleEditController } from './article-edit.controller';
import {
  CreateArticleCommand,
  CreateCommentCommand,
  DeleteArticleCommand,
  DeleteCommentCommand,
  FavoriteArticleCommand,
  UnfavoriteArticleCommand,
  UpdateArticleCommand,
} from './commands';
import {
  CreateArticleRequestDto,
  CreateCommentRequestDto,
  SingleArticleDto,
  SingleCommentDto,
  UpdateArticleRequestDto,
} from './contracts';
import { GetArticleForEditQuery } from './queries';

describe('ArticleEditController', () => {
  let controller: ArticleEditController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  const mockUser: CurrentUserType = { id: 1, publicId: 'test-public-id', username: 'testuser' };

  const mockSingleArticleDto: SingleArticleDto = {
    article: {
      slug: 'test-article-slug',
      title: 'Test Article',
      description: 'Test Description',
      body: 'Test Body',
      tagList: ['tag1', 'tag2'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      favorited: false,
      favoritesCount: 0,
      author: {
        username: 'testuser',
        bio: null,
        image: null,
        following: false,
      },
    },
  };

  const mockSingleCommentDto: SingleCommentDto = {
    comment: {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleEditController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: vi.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: vi.fn(),
          },
        },
      ],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue({ canActivate: vi.fn(() => true) })
      .compile();

    controller = module.get<ArticleEditController>(ArticleEditController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createArticle', () => {
    it('should create an article', async () => {
      const request: CreateArticleRequestDto = {
        article: {
          title: 'Test Article',
          description: 'Test Description',
          body: 'Test Body',
          tagList: ['tag1', 'tag2'],
        },
      };
      vi.mocked(commandBus.execute).mockResolvedValue(mockSingleArticleDto);

      const result = await controller.createArticle(request, mockUser);

      expect(result).toEqual(mockSingleArticleDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new CreateArticleCommand(request, mockUser.id));
    });
  });

  describe('getArticleForEdit', () => {
    it('should get article for editing', async () => {
      const slug = 'test-article-slug';
      vi.mocked(queryBus.execute).mockResolvedValue(mockSingleArticleDto);

      const result = await controller.getArticleForEdit(slug, mockUser);

      expect(result).toEqual(mockSingleArticleDto);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetArticleForEditQuery(slug, mockUser.id));
    });
  });

  describe('updateArticle', () => {
    it('should update an article', async () => {
      const slug = 'test-article-slug';
      const request: UpdateArticleRequestDto = {
        article: {
          title: 'Updated Title',
          description: 'Updated Description',
          body: 'Updated Body',
        },
      };
      vi.mocked(commandBus.execute).mockResolvedValue(mockSingleArticleDto);

      const result = await controller.updateArticle(slug, request, mockUser);

      expect(result).toEqual(mockSingleArticleDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new UpdateArticleCommand(slug, request, mockUser.id));
    });
  });

  describe('deleteArticle', () => {
    it('should delete an article', async () => {
      const slug = 'test-article-slug';
      vi.mocked(commandBus.execute).mockResolvedValue(undefined);

      const result = await controller.deleteArticle(slug, mockUser);

      expect(result).toBeUndefined();
      expect(commandBus.execute).toHaveBeenCalledWith(new DeleteArticleCommand(slug, mockUser.id));
    });
  });

  describe('favoriteArticle', () => {
    it('should favorite an article', async () => {
      const slug = 'test-article-slug';
      vi.mocked(commandBus.execute).mockResolvedValue(mockSingleArticleDto);

      const result = await controller.favoriteArticle(slug, mockUser);

      expect(result).toEqual(mockSingleArticleDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new FavoriteArticleCommand(slug, mockUser.id));
    });
  });

  describe('unfavoriteArticle', () => {
    it('should unfavorite an article', async () => {
      const slug = 'test-article-slug';
      vi.mocked(commandBus.execute).mockResolvedValue(mockSingleArticleDto);

      const result = await controller.unfavoriteArticle(slug, mockUser);

      expect(result).toEqual(mockSingleArticleDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new UnfavoriteArticleCommand(slug, mockUser.id));
    });
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const slug = 'test-article-slug';
      const request: CreateCommentRequestDto = {
        comment: {
          body: 'Test comment',
        },
      };
      vi.mocked(commandBus.execute).mockResolvedValue(mockSingleCommentDto);

      const result = await controller.createComment(slug, request, mockUser);

      expect(result).toEqual(mockSingleCommentDto);
      expect(commandBus.execute).toHaveBeenCalledWith(new CreateCommentCommand(slug, request, mockUser.id));
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const commentId = 1;
      vi.mocked(commandBus.execute).mockResolvedValue(undefined);

      const result = await controller.deleteComment(commentId, mockUser);

      expect(result).toBeUndefined();
      expect(commandBus.execute).toHaveBeenCalledWith(new DeleteCommentCommand(commentId, mockUser.id));
    });
  });
});
