import type { ArticleDto, AuthorDto, ArticleWithRelations } from '../contracts';

/**
 * Convert ArticleWithRelations (DB model) to ArticleDto (API response)
 */
export function toArticleDto(
  article: ArticleWithRelations,
  currentUserId: number,
  isFollowingAuthor: boolean,
): ArticleDto {
  const isFavorited = article.favorites.some((f) => f.userId === currentUserId);

  const author: AuthorDto = {
    username: article.user.username,
    bio: article.user.bio,
    image: article.user.image,
    following: isFollowingAuthor,
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
