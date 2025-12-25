import { ERROR_CODE } from '@monorepo/error-code';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

import type { ErrorParams, ValidationFieldError } from '$errors';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '$errors';

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
    let errors: ValidationFieldError[] | undefined;

    if (exception instanceof UnprocessableEntityError) {
      // UnprocessableEntityError case - GitHub style response
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      errorCode = ERROR_CODE.VALIDATION_ERROR;
      message = 'Validation Failed';
      errors = exception.errors;
    } else if (exception instanceof AppError) {
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

    // Logging
    this.log(request, status, errorCode, message, exception);

    // UnprocessableEntityError returns GitHub-style response
    if (errors) {
      response.status(status).json({
        message,
        errors,
      });
    } else {
      response.status(status).json({
        errorCode,
        message,
        params,
      });
    }
  }

  private log(request: any, status: number, errorCode: string, message: string, exception: unknown) {
    const logData = {
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
    };

    const logMessage = JSON.stringify(logData);

    // Log level based on status code
    // error: 400, 422, 5xx (invalid request or server error)
    // warn: 403 (forbidden, possible attack but could be normal)
    // info: 401, 404, 409 (normal operation)
    if (status >= 500 || status === 400 || status === 422) {
      this.logger.error(logMessage);
    } else if (status === 403) {
      this.logger.warn(logMessage);
    } else {
      // 401, 404, 409 and other 4xx
      this.logger.log(logMessage);
    }
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
