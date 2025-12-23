import { GetFeedQueryDto } from '../../contracts';

export class GetFeedQuery {
  constructor(
    public readonly params: GetFeedQueryDto,
    public readonly currentUserId: number,
  ) {}
}
