import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { provideStore } from '@ngxs/store';

import {
  ClientErrorHandler,
  credentialsInterceptor,
  csrfTokenInterceptor,
  httpErrorInterceptor,
  ssrCookieInterceptor,
} from '$domains/infrastructure';
import { environment } from '$environments';
import { AuthState } from '$modules/auth/store';
import { ErrorState } from '$modules/error/store';
import { SnackbarState } from '$modules/snackbar/store';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: ErrorHandler, useClass: ClientErrorHandler },
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([ssrCookieInterceptor, credentialsInterceptor, csrfTokenInterceptor, httpErrorInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'x-xsrf-token' }),
    ),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // 全ルートを自動プリロード。チャンク合計が2MB超の場合はカスタムプリロード戦略を検討
    ),
    provideStore([AuthState, ErrorState, SnackbarState, SpinnerState], withNgxsFormPlugin()),
    provideZonelessChangeDetection(),
  ],
};
