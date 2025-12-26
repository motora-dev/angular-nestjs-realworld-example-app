import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * HTTP loader for ngx-translate that loads multiple translation files in parallel.
 * Fetches error and ui translation files and merges them into a single translation object.
 */
export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return forkJoin({
      error: this.http.get<TranslationObject>(`/i18n/error/${lang}.json`).pipe(catchError(() => of({}))),
      ui: this.http.get<TranslationObject>(`/i18n/ui/${lang}.json`).pipe(catchError(() => of({}))),
    }).pipe(map(({ error, ui }) => ({ ...ui, ...error })));
  }
}
