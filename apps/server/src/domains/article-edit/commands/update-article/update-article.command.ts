export class UpdateArticleCommand {
  constructor(
    public readonly userId: number,
    public readonly articleId: string,
    public readonly title: string,
    public readonly tags: string[],
    public readonly content: string,
  ) {}
}
