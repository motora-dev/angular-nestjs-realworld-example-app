/**
 * クライアント側で発生する404エラーを表すカスタムエラークラス
 * ページ遷移が必要な場合に使用する
 */
export class NotFoundError extends Error {
  readonly statusCode: number = 404;

  constructor(message: string = 'ページが見つかりませんでした') {
    super(message);
    this.name = 'NotFoundError';
    // Error クラスのプロトタイプチェーンを正しく設定
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
