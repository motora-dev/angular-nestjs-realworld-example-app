export class DeleteCommentCommand {
  constructor(
    public readonly commentId: number,
    public readonly currentUserId: number,
  ) {}
}
