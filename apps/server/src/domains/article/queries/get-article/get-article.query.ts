export class GetArticleQuery {
  constructor(
    public readonly slug: string,
    public readonly currentUserId?: number,
  ) {}
}
