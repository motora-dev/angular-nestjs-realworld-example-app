import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  ArticleDto,
  AuthorDto,
  CommentDto,
  CreateArticleRequestDto,
  CreateCommentRequestDto,
  SingleArticleDto,
  SingleCommentDto,
  UpdateArticleRequestDto,
} from '../dto';
import {
  ArticleEditRepository,
  ArticleWithRelations,
  CommentWithAuthor,
} from '../repositories/article-edit.repository';

@Injectable()
export class ArticleEditService {
  constructor(private readonly repository: ArticleEditRepository) {}

  /**
   * Create a new article
   */
  async createArticle(
    request: CreateArticleRequestDto,
    currentUserId: number,
  ): Promise<SingleArticleDto> {
    const article = await this.repository.create({
      title: request.article.title,
      description: request.article.description,
      body: request.article.body,
      tagList: request.article.tagList || [],
      userId: currentUserId,
    });

    const articleDto = await this.mapArticleToDto(article, currentUserId);
    return { article: articleDto };
  }

  /**
   * Get article for editing (must be owner)
   */
  async getArticleForEdit(
    slug: string,
    currentUserId: number,
  ): Promise<SingleArticleDto> {
    const article = await this.repository.getBySlug(slug);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.userId !== currentUserId) {
      throw new ForbiddenException('You are not the author of this article');
    }

    const articleDto = await this.mapArticleToDto(article, currentUserId);
    return { article: articleDto };
  }

  /**
   * Update an article
   */
  async updateArticle(
    slug: string,
    request: UpdateArticleRequestDto,
    currentUserId: number,
  ): Promise<SingleArticleDto> {
    const existingArticle = await this.repository.getBySlug(slug);

    if (!existingArticle) {
      throw new NotFoundException('Article not found');
    }

    if (existingArticle.userId !== currentUserId) {
      throw new ForbiddenException('You are not the author of this article');
    }

    const article = await this.repository.update(slug, {
      title: request.article.title,
      description: request.article.description,
      body: request.article.body,
    });

    const articleDto = await this.mapArticleToDto(article, currentUserId);
    return { article: articleDto };
  }

  /**
   * Delete an article
   */
  async deleteArticle(slug: string, currentUserId: number): Promise<void> {
    const article = await this.repository.getBySlug(slug);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.userId !== currentUserId) {
      throw new ForbiddenException('You are not the author of this article');
    }

    await this.repository.delete(slug);
  }

  /**
   * Favorite an article
   */
  async favoriteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<SingleArticleDto> {
    const article = await this.repository.addFavorite(slug, currentUserId);
    const articleDto = await this.mapArticleToDto(article, currentUserId);
    return { article: articleDto };
  }

  /**
   * Unfavorite an article
   */
  async unfavoriteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<SingleArticleDto> {
    const article = await this.repository.removeFavorite(slug, currentUserId);
    const articleDto = await this.mapArticleToDto(article, currentUserId);
    return { article: articleDto };
  }

  /**
   * Create a comment
   */
  async createComment(
    slug: string,
    request: CreateCommentRequestDto,
    currentUserId: number,
  ): Promise<SingleCommentDto> {
    const comment = await this.repository.createComment(
      slug,
      currentUserId,
      request.comment.body,
    );

    const commentDto = await this.mapCommentToDto(comment, currentUserId);
    return { comment: commentDto };
  }

  /**
   * Delete a comment
   */
  async deleteComment(
    commentId: number,
    currentUserId: number,
  ): Promise<void> {
    const comment = await this.repository.getComment(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== currentUserId) {
      throw new ForbiddenException('You are not the author of this comment');
    }

    await this.repository.deleteComment(commentId, currentUserId);
  }

  /**
   * Map database article to DTO
   */
  private async mapArticleToDto(
    article: ArticleWithRelations,
    currentUserId: number,
  ): Promise<ArticleDto> {
    const isFavorited = article.favorites.some(
      (f) => f.userId === currentUserId,
    );

    const isFollowing = await this.repository.isFollowing(
      currentUserId,
      article.user.id,
    );

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
  private async mapCommentToDto(
    comment: CommentWithAuthor,
    currentUserId: number,
  ): Promise<CommentDto> {
    const isFollowing = await this.repository.isFollowing(
      currentUserId,
      comment.user.id,
    );

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
