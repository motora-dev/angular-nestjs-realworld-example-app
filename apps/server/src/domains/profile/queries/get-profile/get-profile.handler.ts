import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetProfileQuery } from '$domains/profile/queries/get-profile/get-profile.query';
import { ProfileService } from '$domains/profile/services/profile.service';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(private readonly service: ProfileService) {}

  async execute(query: GetProfileQuery) {
    return this.service.getProfile(query.username, query.currentUserId);
  }
}
