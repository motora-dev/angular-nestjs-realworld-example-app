import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideStore } from '@ngxs/store';
import { vi } from 'vitest';

import { AuthState } from '$modules/auth/store';
import { ErrorState } from '$modules/error/store';
import { SnackbarState } from '$modules/snackbar/store';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { App } from './app';

describe('App', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<App>;
  let originalRequestIdleCallback: typeof requestIdleCallback | undefined;
  let originalSetTimeout: typeof setTimeout;
  let preloadSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    // requestIdleCallbackとsetTimeoutをモックして即座に実行されるようにする
    originalRequestIdleCallback = globalThis.requestIdleCallback;
    originalSetTimeout = globalThis.setTimeout;

    // requestIdleCallbackをモック（即座に実行）
    globalThis.requestIdleCallback = ((callback: IdleRequestCallback) => {
      callback({ didTimeout: false, timeRemaining: () => 0 });
      return 0;
    }) as typeof requestIdleCallback;

    // setTimeoutをモック（即座に実行）
    globalThis.setTimeout = ((callback: () => void) => {
      callback();
      return 0;
    }) as typeof setTimeout;

    // preload()メソッドを空のメソッドでモック
    preloadSpy = vi.spyOn(App.prototype as any, 'preload').mockImplementation(() => {
      // 空の実装
    });

    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([AuthState, ErrorState, SnackbarState, SpinnerState]),
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // fixtureを破棄して非同期処理をクリーンアップ
    if (fixture) {
      fixture.destroy();
    }
    httpMock.verify();

    // モックを元に戻す
    if (preloadSpy) {
      preloadSpy.mockRestore();
    }
    if (originalRequestIdleCallback !== undefined) {
      globalThis.requestIdleCallback = originalRequestIdleCallback;
    } else {
      delete (globalThis as any).requestIdleCallback;
    }
    globalThis.setTimeout = originalSetTimeout;
  });

  it('should create the app', async () => {
    fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();

    await fixture.whenStable();
  });

  it('should render header', async () => {
    fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });

  it('should render footer', async () => {
    fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });
});
