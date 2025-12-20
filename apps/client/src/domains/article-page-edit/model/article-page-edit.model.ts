export interface PageItem {
  articleId: string;
  pageId: string;
  title: string;
  level: number;
  order: number;
}

/** フォームの値モデル */
export interface RootFormModel {
  articleId: string;
  pageId: string;
  title: string;
  description: string;
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
  content: string;
}

/** NGXS form plugin のフォーム状態 */
export interface EditFormState {
  model: EditFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}

export type FormModel = RootFormModel & EditFormModel;
