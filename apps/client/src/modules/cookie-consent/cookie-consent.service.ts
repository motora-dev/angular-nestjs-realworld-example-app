import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'cookie-consent';

export type ConsentStatus = 'accepted' | 'rejected' | null;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class CookieConsentService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _consent = signal<ConsentStatus>(null);
  private readonly _isLoading = signal(true);

  readonly consent = this._consent.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus;
      this._consent.set(stored);
      this._isLoading.set(false);

      // 同意済みの場合は即座にConsent Modeを更新
      if (stored === 'accepted') {
        this.updateConsentMode('accepted');
      }
    } else {
      this._isLoading.set(false);
    }
  }

  acceptConsent(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      this._consent.set('accepted');
      this.updateConsentMode('accepted');
    }
  }

  rejectConsent(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, 'rejected');
      this._consent.set('rejected');
      // 拒否時はdeniedのまま維持
    }
  }

  resetConsent(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(STORAGE_KEY);
      this._consent.set(null);
      // ページをリロードして設定を反映
      window.location.reload();
    }
  }

  private updateConsentMode(status: 'accepted' | 'rejected'): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (status === 'accepted' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    }
    // 拒否時はdeniedのまま維持（何もしない）
  }
}
