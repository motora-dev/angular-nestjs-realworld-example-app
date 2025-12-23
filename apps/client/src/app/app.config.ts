import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { provideStore } from '@ngxs/store';

import { ArticleState } from '$domains/article/store';
import { CommentsState } from '$domains/comments/store';
import { ClientErrorHandler } from '$domains/error-handlers';
import { HomeState } from '$domains/home/store';
import {
  credentialsInterceptor,
  csrfTokenInterceptor,
  httpErrorInterceptor,
  ssrCookieInterceptor,
} from '$domains/interceptors';
import { ProfileState } from '$domains/profile/store';
import { environment } from '$environments';
import { AuthState } from '$modules/auth/store';
import { ErrorState } from '$modules/error/store';
import { SnackbarState } from '$modules/snackbar/store';
import { SpinnerState } from '$modules/spinner/store';
import { StaticTranslateLoader } from '$shared/i18n';
import { API_URL } from '$shared/lib';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_URL, useValue: environment.apiUrl },
    { provide: ErrorHandler, useClass: ClientErrorHandler },
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'ja',
        loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
      }),
    ),
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        ssrCookieInterceptor,
        credentialsInterceptor,
        ...(environment.production === false ? [csrfTokenInterceptor] : []),
        httpErrorInterceptor,
      ]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'x-xsrf-token' }),
    ),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules), // 全ルートを自動プリロード。チャンク合計が2MB超の場合はカスタムプリロード戦略を検討
    ),
    provideStore(
      [ArticleState, AuthState, CommentsState, ErrorState, HomeState, ProfileState, SnackbarState, SpinnerState],
      withNgxsFormPlugin(),
    ),
    provideZonelessChangeDetection(),
  ],
};
