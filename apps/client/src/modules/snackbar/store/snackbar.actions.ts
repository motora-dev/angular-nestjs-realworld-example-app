export class ShowSnackbar {
  static readonly type = '[Snackbar] Show';
  constructor(
    public message: string,
    public type: 'success' | 'error' | 'info' | 'warning' = 'info',
    public duration: number = 3000,
    public id?: string,
  ) {}
}

export class HideSnackbar {
  static readonly type = '[Snackbar] Hide';
  constructor(public id: string) {}
}
