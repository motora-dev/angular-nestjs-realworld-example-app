import { GetArticlesQueryDto } from '../../dto';

export class GetArticlesQuery {
  constructor(
    public readonly params: GetArticlesQueryDto,
    public readonly currentUserId?: number,
  ) {}
}
