import type { AuthorDto, CommentDto, CommentWithAuthor } from '$domains/article-edit/contracts';

/**
 * Convert CommentWithAuthor (DB model) to CommentDto (API response)
 */
export function toCommentDto(comment: CommentWithAuthor, isFollowingAuthor: boolean): CommentDto {
  const author: AuthorDto = {
    username: comment.user.username,
    bio: comment.user.bio,
    image: comment.user.image,
    following: isFollowingAuthor,
  };

  return {
    id: comment.id,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    body: comment.body,
    author,
  };
}
