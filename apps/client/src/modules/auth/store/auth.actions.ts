import { User } from '../model';

export class SetAuthenticated {
  static readonly type = '[Auth] Set Authenticated';
  constructor(public isAuthenticated: boolean) {}
}

export class SetCurrentUser {
  static readonly type = '[Auth] Set Current User';
  constructor(public user: User | null) {}
}

export class SetPendingRegistration {
  static readonly type = '[Auth] Set Pending Registration';
  constructor(public email: string | null) {}
}

export class ClearPendingRegistration {
  static readonly type = '[Auth] Clear Pending Registration';
}
