import { EditorFormModel } from '../model';

export class SetEditorForm {
  static readonly type = '[Editor] Set Editor Form';
  constructor(public form: EditorFormModel) {}
}

export class ClearEditorForm {
  static readonly type = '[Editor] Clear Editor Form';
}
