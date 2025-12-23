import { Profile } from '$domains/profile';

/** Article data for editor */
export interface EditorArticle {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited: boolean;
  favoritesCount: number;
  author: Profile;
}

/** Editor form model */
export interface EditorFormModel {
  title: string;
  description: string;
  body: string;
}

/** NGXS form plugin state */
export interface EditorFormState {
  model: EditorFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}
