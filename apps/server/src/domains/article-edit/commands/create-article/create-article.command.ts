import type { CreateArticleRequestDto } from '../../contracts';

export class CreateArticleCommand {
  constructor(
    public readonly request: CreateArticleRequestDto,
    public readonly currentUserId: number,
  ) {}
}
