export class SetPendingRegistration {
  static readonly type = '[AuthRegister] Set Pending Registration';
  constructor(public email: string | null) {}
}

export class ClearPendingRegistration {
  static readonly type = '[AuthRegister] Clear Pending Registration';
}
