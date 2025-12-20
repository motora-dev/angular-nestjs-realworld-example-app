export * from './auth';
export * from './cookie-consent';
export * from './error';
export * from './isr';
export * from './seo';
export * from './snackbar';
export * from './spinner';
export * from './ui';

// Aggregate all NGXS states from modules for store configuration
import { AuthState } from './auth/store';
import { ErrorState } from './error/store';
import { SnackbarState } from './snackbar/store';
import { SpinnerState } from './spinner/store';
import { UiState } from './ui/store';

export const MODULE_STATES = [AuthState, ErrorState, SnackbarState, SpinnerState, UiState];
