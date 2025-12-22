export class DeleteArticleCommand {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {}
}

