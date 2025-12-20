export class SetAuthenticated {
  static readonly type = '[Auth] Set Authenticated';
  constructor(public isAuthenticated: boolean) {}
}
