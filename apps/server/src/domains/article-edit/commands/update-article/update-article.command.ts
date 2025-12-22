import type { UpdateArticleRequestDto } from '../../dto';

export class UpdateArticleCommand {
  constructor(
    public readonly slug: string,
    public readonly request: UpdateArticleRequestDto,
    public readonly currentUserId: number,
  ) {}
}
