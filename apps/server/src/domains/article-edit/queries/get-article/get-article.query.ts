export class GetArticleQuery {
  constructor(
    public readonly userId: number,
    public readonly articleId: string,
  ) {}
}
