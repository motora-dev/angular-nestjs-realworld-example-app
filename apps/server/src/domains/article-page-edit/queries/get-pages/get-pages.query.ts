export class GetPagesQuery {
  constructor(
    public readonly userId: number,
    public readonly articleId: string,
  ) {}
}
