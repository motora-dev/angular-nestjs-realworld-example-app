import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaAdapterModule } from '$adapters';
import { ArticleListController } from './article-list.controller';
import { ArticleListModule } from './article-list.module';
import { GetArticleListHandler } from './queries';
import { ArticleListRepository } from './repositories';
import { ArticleListService } from './services';

describe('ArticleListModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ArticleListModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have ArticleListController', () => {
    const controller = module.get<ArticleListController>(ArticleListController);
    expect(controller).toBeDefined();
  });

  it('should have ArticleListService', () => {
    const service = module.get<ArticleListService>(ArticleListService);
    expect(service).toBeDefined();
  });

  it('should have ArticleListRepository', () => {
    const repository = module.get<ArticleListRepository>(ArticleListRepository);
    expect(repository).toBeDefined();
  });

  it('should have GetArticleListHandler', () => {
    const handler = module.get<GetArticleListHandler>(GetArticleListHandler);
    expect(handler).toBeDefined();
  });

  it('should import required modules', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ArticleListModule],
    }).compile();

    const cqrsModule = moduleRef.get(CqrsModule, { strict: false });
    const prismaModule = moduleRef.get(PrismaAdapterModule, { strict: false });

    expect(cqrsModule).toBeDefined();
    expect(prismaModule).toBeDefined();
  });
});
