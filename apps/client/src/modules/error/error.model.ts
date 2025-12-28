/** API error (HTTP response error) */
export interface ApiError {
  type: 'api';
  errorCode: string;
  message: string;
}

/** Server error (HTTP response error) */
export interface ServerError {
  type: 'server';
  status: number;
  message: string;
}

/** Client error (runtime error) */
export interface ClientError {
  type: 'client';
  message: string;
}

/** Application error (API error | Client error) */
export type AppError = ApiError | ServerError | ClientError;
