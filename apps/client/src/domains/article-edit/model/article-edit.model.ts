/** フォームの値モデル */
export interface RootFormModel {
  articleId: string;
}

/** NGXS form plugin のフォーム状態 */
export interface RootFormState {
  model: RootFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}

/** フォームの値モデル */
export interface EditFormModel {
  title: string;
  description: string;
  tags: string[];
}

/** NGXS form plugin のフォーム状態 */
export interface EditFormState {
  model: EditFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}

export interface ArticleEditPageItem {
  articleId: string;
  pageId: string;
  title: string;
  level: number;
  order: number;
}

export type FormModel = RootFormModel & EditFormModel;
