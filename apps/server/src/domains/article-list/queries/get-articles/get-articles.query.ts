import { GetArticlesQueryDto } from '../../contracts';

export class GetArticlesQuery {
  constructor(
    public readonly params: GetArticlesQueryDto,
    public readonly currentUserId?: number,
  ) {}
}
