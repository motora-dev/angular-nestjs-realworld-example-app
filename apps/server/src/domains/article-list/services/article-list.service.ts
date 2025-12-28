import { Injectable } from '@nestjs/common';

import type {
  ArticleWithRelations,
  GetArticlesQueryDto,
  GetFeedQueryDto,
  MultipleArticlesDto,
  TagsDto,
} from '$domains/article-list/contracts';
import { toArticleDto } from '$domains/article-list/presenters';
import { ArticleListRepository } from '$domains/article-list/repositories/article-list.repository';

@Injectable()
export class ArticleListService {
  constructor(private readonly repository: ArticleListRepository) {}

  /**
   * Get articles with filters and pagination
   */
  async getArticles(query: GetArticlesQueryDto, currentUserId?: number): Promise<MultipleArticlesDto> {
    const { articles, count } = await this.repository.getArticles({
      tag: query.tag,
      author: query.author,
      favorited: query.favorited,
      offset: query.offset,
      limit: query.limit,
      currentUserId,
    });

    const articleDtos = await this.mapArticlesToDto(articles, currentUserId);

    return {
      articles: articleDtos,
      articlesCount: count,
    };
  }

  /**
   * Get feed articles (from followed users)
   */
  async getFeed(query: GetFeedQueryDto, currentUserId: number): Promise<MultipleArticlesDto> {
    const { articles, count } = await this.repository.getFeed({
      offset: query.offset,
      limit: query.limit,
      currentUserId,
    });

    const articleDtos = await this.mapArticlesToDto(articles, currentUserId);

    return {
      articles: articleDtos,
      articlesCount: count,
    };
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<TagsDto> {
    const tags = await this.repository.getTags();
    return { tags };
  }

  /**
   * Map database articles to DTOs
   */
  private async mapArticlesToDto(
    articles: ArticleWithRelations[],
    currentUserId?: number,
  ): Promise<ReturnType<typeof toArticleDto>[]> {
    return Promise.all(
      articles.map(async (article) => {
        const isFollowing = currentUserId ? await this.repository.isFollowing(currentUserId, article.user.id) : false;
        return toArticleDto(article, currentUserId, isFollowing);
      }),
    );
  }
}
