import { AppError } from '../error.model';

export class ShowError {
  static readonly type = '[Error] Show Error';
  constructor(public error: AppError) {}
}

export class ClearError {
  static readonly type = '[Error] Clear Error';
}
