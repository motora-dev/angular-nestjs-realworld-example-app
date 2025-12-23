import { Profile } from '$domains/profile';

export interface CommentResponse {
  id: string;
  body: string;
  createdAt: string;
  author: Profile;
}

export interface CommentsResponse {
  comments: CommentResponse[];
}

export interface SingleCommentResponse {
  comment: CommentResponse;
}
