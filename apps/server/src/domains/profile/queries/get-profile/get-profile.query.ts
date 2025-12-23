export class GetProfileQuery {
  constructor(
    public readonly username: string,
    public readonly currentUserId?: number,
  ) {}
}
