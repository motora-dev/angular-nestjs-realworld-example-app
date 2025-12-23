import { SettingsFormModel } from '../model';

export class SetSettingsForm {
  static readonly type = '[Settings] Set Settings Form';
  constructor(public form: SettingsFormModel) {}
}

export class ClearSettingsForm {
  static readonly type = '[Settings] Clear Settings Form';
}
