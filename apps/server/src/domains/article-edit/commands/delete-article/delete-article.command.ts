import { Command } from '@nestjs/cqrs';

export class DeleteArticleCommand extends Command<void> {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {
    super();
  }
}
