import { IQuery } from '@nestjs/cqrs';

import type { CurrentUserType } from '$decorators';

export class GetCurrentAuthUserQuery implements IQuery {
  constructor(public readonly user: CurrentUserType) {}
}
