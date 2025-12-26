export class FollowUserCommand {
  constructor(
    public readonly username: string,
    public readonly currentUserId: number,
  ) {}
}
