import { Controller } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommandBus } from "@nestjs/cqrs";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly _commandBus: CommandBus,
    private readonly _configService: ConfigService
  ) {}
}
