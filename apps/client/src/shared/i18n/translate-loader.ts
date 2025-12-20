import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

import jaJson from '../../../public/i18n/ja.json';

/**
 * 静的に翻訳ファイルを読み込むローダー
 * HTTPリクエストなしで翻訳を提供するため、SSRでのパフォーマンスが向上
 */
export class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    switch (lang) {
      case 'ja':
        return of(jaJson as TranslationObject);
      default:
        return of(jaJson as TranslationObject);
    }
  }
}
