import { NotFoundError } from '$errors';
import { ERROR_CODE } from '@monorepo/error-code';
import { Controller, Get } from '@nestjs/common';

@Controller('logging')
export class LoggingControllerMock {
  @Get('success')
  success(): { message: string } {
    return { message: 'success' };
  }

  @Get('error')
  throwError(): never {
    throw new NotFoundError(ERROR_CODE.USER_NOT_FOUND, { userId: 'test-user-123' });
  }
}
