import { ERROR_CODE } from '@monorepo/error-code';
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '$errors';

@Controller('http-exception')
export class HttpExceptionControllerMock {
  @Get('bad-request')
  throwBadRequest(): never {
    throw new BadRequestError(ERROR_CODE.VALIDATION_ERROR, { field: 'filename' });
  }

  @Get('unauthorized')
  throwUnauthorized(): never {
    throw new UnauthorizedError(ERROR_CODE.UNAUTHORIZED);
  }

  @Get('forbidden')
  throwForbidden(): never {
    throw new ForbiddenError(ERROR_CODE.FORBIDDEN, { articleId: 'abc123' });
  }

  @Get('not-found')
  throwNotFound(): never {
    throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND, { userId: 'user-123' });
  }

  @Get('conflict')
  throwConflict(): never {
    throw new ConflictError(ERROR_CODE.USERNAME_ALREADY_EXISTS, { username: 'johndoe' });
  }

  @Get('internal-server-error')
  throwInternalServerError(): never {
    throw new InternalServerError(ERROR_CODE.INTERNAL_SERVER_ERROR);
  }

  @Get('http-exception')
  throwHttpException(): never {
    throw new HttpException('Bad Request from HttpException', HttpStatus.BAD_REQUEST);
  }

  @Get('unexpected')
  throwUnexpected(): never {
    throw new Error('Unexpected error occurred');
  }
}
