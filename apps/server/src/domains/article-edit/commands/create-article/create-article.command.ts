import type { CreateArticleRequestDto } from '../../dto';

export class CreateArticleCommand {
  constructor(
    public readonly request: CreateArticleRequestDto,
    public readonly currentUserId: number,
  ) {}
}
