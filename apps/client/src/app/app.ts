import { isPlatformBrowser } from '@angular/common';
import { Component, DOCUMENT, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
  CookieConsentComponent,
  ErrorDialogComponent,
  FooterComponent,
  HeaderComponent,
  SnackbarComponent,
  SpinnerComponent,
} from '$components/layouts';
import { AuthFacade } from '$modules/auth';

/** Material Symbols Outlined フォントURL*/
const MATERIAL_SYMBOLS_URL =
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SpinnerComponent,
    SnackbarComponent,
    ErrorDialogComponent,
    CookieConsentComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authFacade = inject(AuthFacade);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly isAuthenticated$ = this.authFacade.isAuthenticated$;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => this.preload());
    } else {
      setTimeout(() => this.preload(), 100);
    }
  }

  private preload(): void {
    this.checkSessionOnIdle();
    this.preloadMaterialSymbolsFont();
    this.preloadMarkdownLibs();
  }

  /**
   * セッション確認をrequestIdleCallbackで遅延実行
   * クリティカルパスから外すことで、初期ロード時間を短縮
   */
  private checkSessionOnIdle(): void {
    // セッション確認を非クリティカルパスとして遅延実行
    this.authFacade.checkSession();
  }

  private preloadMaterialSymbolsFont(): void {
    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = MATERIAL_SYMBOLS_URL;
    this.document.head.appendChild(link);
  }

  private preloadMarkdownLibs(): void {}
}
