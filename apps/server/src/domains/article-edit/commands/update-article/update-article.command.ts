import type { UpdateArticleRequestDto } from '../../contracts';

export class UpdateArticleCommand {
  constructor(
    public readonly slug: string,
    public readonly request: UpdateArticleRequestDto,
    public readonly currentUserId: number,
  ) {}
}
