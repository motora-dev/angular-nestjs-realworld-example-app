/** Settings form model */
export interface SettingsFormModel {
  image: string;
  username: string;
  bio: string;
  email: string;
}

/** NGXS form plugin state */
export interface SettingsFormState {
  model: SettingsFormModel;
  dirty: boolean;
  status: string;
  errors: Record<string, unknown>;
}
