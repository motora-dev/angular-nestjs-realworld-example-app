import { Injectable } from '@nestjs/common';

import { ArticleDto, AuthorDto, GetArticlesQueryDto, GetFeedQueryDto, MultipleArticlesDto, TagsDto } from '../dto';
import { ArticleListRepository, ArticleWithRelations } from '../repositories/article-list.repository';

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
  private async mapArticlesToDto(articles: ArticleWithRelations[], currentUserId?: number): Promise<ArticleDto[]> {
    return Promise.all(
      articles.map(async (article) => {
        const isFavorited = currentUserId ? article.favorites.some((f) => f.userId === currentUserId) : false;

        const isFollowing = currentUserId ? await this.repository.isFollowing(currentUserId, article.user.id) : false;

        const author: AuthorDto = {
          username: article.user.username,
          bio: article.user.bio,
          image: article.user.image,
          following: isFollowing,
        };

        return {
          slug: article.slug,
          title: article.title,
          description: article.description,
          tagList: article.tags,
          createdAt: article.createdAt.toISOString(),
          updatedAt: article.updatedAt.toISOString(),
          favorited: isFavorited,
          favoritesCount: article._count.favorites,
          author,
        };
      }),
    );
  }
}
