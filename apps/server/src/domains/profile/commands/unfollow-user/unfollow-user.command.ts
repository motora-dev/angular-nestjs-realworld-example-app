export class UnfollowUserCommand {
  constructor(
    public readonly username: string,
    public readonly currentUserId: number,
  ) {}
}

