/** APIエラー（HTTPレスポンスエラー） */
export interface ApiError {
  type: 'api';
  errorCode: string;
  message: string;
}

/** サーバーエラー（HTTPレスポンスエラー） */
export interface ServerError {
  type: 'server';
  status: number;
  message: string;
}

/** クライアントエラー（ランタイムエラー） */
export interface ClientError {
  type: 'client';
  message: string;
}

/** アプリケーションエラー（APIエラー | クライアントエラー） */
export type AppError = ApiError | ServerError | ClientError;
