import { Profile } from '../model';

export class SetProfile {
  static readonly type = '[Profile] Set Profile';
  constructor(public profile: Profile | null) {}
}

export class ClearProfile {
  static readonly type = '[Profile] Clear Profile';
}
