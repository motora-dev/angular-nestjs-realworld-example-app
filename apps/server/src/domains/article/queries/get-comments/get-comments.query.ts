export class GetCommentsQuery {
  constructor(
    public readonly slug: string,
    public readonly currentUserId?: number,
  ) {}
}
