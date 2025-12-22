export class UnfavoriteArticleCommand {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {}
}

