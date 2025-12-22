export class GetArticleForEditQuery {
  constructor(
    public readonly slug: string,
    public readonly currentUserId: number,
  ) {}
}

