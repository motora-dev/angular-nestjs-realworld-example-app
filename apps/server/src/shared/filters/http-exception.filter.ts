import { ERROR_CODE } from '@monorepo/error-code';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '$errors';

import type { ErrorParams } from '$errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse<Response>();

    let status: number;
    let errorCode: string = '';
    let message: string;
    let params: ErrorParams | undefined;

    if (exception instanceof AppError) {
      // AppError case
      status = getStatusCode(exception);
      errorCode = exception.code;
      message = exception.message;
      params = exception.params;
    } else if (exception instanceof HttpException) {
      // NestJS standard HttpException case
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'string' ? errorResponse : (errorResponse as any).message;
    } else {
      // Other unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
    }

    // Unify error code for 5xx errors in production (security measure)
    const is5xxError = status >= 500 && status < 600;
    const isProd = process.env.NODE_ENV === 'production';

    if (is5xxError && isProd) {
      errorCode = ERROR_CODE.INTERNAL_SERVER_ERROR;
      params = undefined; // Also hide params in production for 5xx errors
    }

    // Error logging
    this.logger.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        message: `Request failed with status ${status}`,
        requestId: request.id,
        userId: request.user?.id,
        endpoint: request.originalUrl || request.url,
        method: request.method,
        statusCode: status,
        errorCode,
        error: message,
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    );

    response.status(status).json({
      errorCode,
      message,
      params,
    });
  }
}

const getStatusCode = (exception: AppError): number => {
  if (exception instanceof BadRequestError) {
    return HttpStatus.BAD_REQUEST;
  }
  if (exception instanceof UnauthorizedError) {
    return HttpStatus.UNAUTHORIZED;
  }
  if (exception instanceof ForbiddenError) {
    return HttpStatus.FORBIDDEN;
  }
  if (exception instanceof NotFoundError) {
    return HttpStatus.NOT_FOUND;
  }
  if (exception instanceof ConflictError) {
    return HttpStatus.CONFLICT;
  }
  if (exception instanceof InternalServerError) {
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
  return HttpStatus.INTERNAL_SERVER_ERROR;
};
