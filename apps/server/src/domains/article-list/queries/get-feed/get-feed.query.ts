import { GetFeedQueryDto } from '../../dto';

export class GetFeedQuery {
  constructor(
    public readonly params: GetFeedQueryDto,
    public readonly currentUserId: number,
  ) {}
}
