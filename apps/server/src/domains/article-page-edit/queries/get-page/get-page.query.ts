export class GetPageQuery {
  constructor(
    public readonly userId: number,
    public readonly articleId: string,
    public readonly pageId: string,
  ) {}
}
