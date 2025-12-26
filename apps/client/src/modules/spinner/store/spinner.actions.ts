export class ShowSpinner {
  static readonly type = '[Spinner] Show';
  constructor(public message?: string) {}
}

export class HideSpinner {
  static readonly type = '[Spinner] Hide';
}
