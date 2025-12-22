export class FavoriteArticleCommand {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {}
}

