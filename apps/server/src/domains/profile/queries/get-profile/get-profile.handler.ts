import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import type { ProfileResponseDto } from '../../dto';
import { ProfileService } from '../../services/profile.service';
import { GetProfileQuery } from './get-profile.query';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(private readonly service: ProfileService) {}

  async execute(query: GetProfileQuery): Promise<ProfileResponseDto> {
    return this.service.getProfile(query.username, query.currentUserId);
  }
}

