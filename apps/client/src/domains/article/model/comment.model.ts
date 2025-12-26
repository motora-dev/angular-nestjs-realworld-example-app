import { Profile } from '$domains/profile';

export interface Comment {
  id: string;
  body: string;
  createdAt: Date;
  author: Profile;
}

/** Comment form model */
export interface CommentFormModel {
  body: string;
}

/** NGXS form plugin state */
export interface CommentFormState {
  model: CommentFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}
