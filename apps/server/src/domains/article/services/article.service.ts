import { ERROR_CODE } from '@monorepo/error-code';
import { Injectable } from '@nestjs/common';

import { NotFoundError } from '$errors';
import { toArticleDto } from '../presenters';
import { toCommentDto } from '../presenters';
import { ArticleRepository } from '../repositories';

import type { MultipleCommentsDto, SingleArticleDto } from '../contracts';

@Injectable()
export class ArticleService {
  constructor(private readonly repository: ArticleRepository) {}

  /**
   * Get article by slug
   */
  async getArticle(slug: string, currentUserId?: number): Promise<SingleArticleDto> {
    const article = await this.repository.getBySlug(slug);

    if (!article) {
      throw new NotFoundError(ERROR_CODE.ARTICLE_NOT_FOUND);
    }

    const isFollowing = currentUserId ? await this.repository.isFollowing(currentUserId, article.user.id) : false;

    const articleDto = toArticleDto(article, currentUserId, isFollowing);

    return { article: articleDto };
  }

  /**
   * Get comments for an article
   */
  async getComments(slug: string, currentUserId?: number): Promise<MultipleCommentsDto> {
    const comments = await this.repository.getComments(slug);

    const commentDtos = await Promise.all(
      comments.map(async (comment) => {
        const isFollowing = currentUserId ? await this.repository.isFollowing(currentUserId, comment.user.id) : false;
        return toCommentDto(comment, isFollowing);
      }),
    );

    return { comments: commentDtos };
  }
}
