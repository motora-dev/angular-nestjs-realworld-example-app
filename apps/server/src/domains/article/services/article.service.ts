import { Injectable, NotFoundException } from '@nestjs/common';

import { ArticleRepository, ArticleWithRelations, CommentWithAuthor } from '../repositories/article.repository';

import type { ArticleDto, AuthorDto, CommentDto, MultipleCommentsDto, SingleArticleDto } from '../dto';

@Injectable()
export class ArticleService {
  constructor(private readonly repository: ArticleRepository) {}

  /**
   * Get article by slug
   */
  async getArticle(slug: string, currentUserId?: number): Promise<SingleArticleDto> {
    const article = await this.repository.getBySlug(slug);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const articleDto = await this.mapArticleToDto(article, currentUserId);

    return { article: articleDto };
  }

  /**
   * Get comments for an article
   */
  async getComments(slug: string, currentUserId?: number): Promise<MultipleCommentsDto> {
    const comments = await this.repository.getComments(slug);

    const commentDtos = await Promise.all(comments.map((comment) => this.mapCommentToDto(comment, currentUserId)));

    return { comments: commentDtos };
  }

  /**
   * Map database article to DTO
   */
  private async mapArticleToDto(article: ArticleWithRelations, currentUserId?: number): Promise<ArticleDto> {
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
      body: article.body,
      tagList: article.tags,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      favorited: isFavorited,
      favoritesCount: article._count.favorites,
      author,
    };
  }

  /**
   * Map database comment to DTO
   */
  private async mapCommentToDto(comment: CommentWithAuthor, currentUserId?: number): Promise<CommentDto> {
    const isFollowing = currentUserId ? await this.repository.isFollowing(currentUserId, comment.user.id) : false;

    const author: AuthorDto = {
      username: comment.user.username,
      bio: comment.user.bio,
      image: comment.user.image,
      following: isFollowing,
    };

    return {
      id: comment.id,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      body: comment.body,
      author,
    };
  }
}
