export class UpdatePageCommand {
  constructor(
    public readonly userId: number,
    public readonly articleId: string,
    public readonly pageId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly content: string,
  ) {}
}
