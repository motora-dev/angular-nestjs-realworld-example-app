import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetProfileQuery } from './get-profile.query';
import { ProfileService } from '../../services/profile.service';

import type { ProfileResponseDto } from '../../contracts';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(private readonly service: ProfileService) {}

  async execute(query: GetProfileQuery): Promise<ProfileResponseDto> {
    return this.service.getProfile(query.username, query.currentUserId);
  }
}
