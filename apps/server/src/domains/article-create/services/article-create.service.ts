import { Injectable } from '@nestjs/common';

import { CreateArticleResponseDto } from '../dto';
import { ArticleCreateRepository } from '../repositories';

import type { Article } from '@monorepo/database/client';

@Injectable()
export class ArticleCreateService {
  constructor(private readonly articleEditRepository: ArticleCreateRepository) {}

  async createArticle(userId: number): Promise<CreateArticleResponseDto> {
    const article: Article | null = await this.articleEditRepository.createArticle(userId);

    return {
      id: article.publicId,
    };
  }
}
