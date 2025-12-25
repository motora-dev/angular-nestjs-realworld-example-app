import { Body, Controller, Post } from '@nestjs/common';

import { RegisterDto } from '$modules/auth/contracts';

@Controller('auth-mock')
export class AuthControllerMock {
  @Post('register')
  register(@Body() body: RegisterDto): { success: boolean; username: string } {
    return { success: true, username: body.username };
  }
}
