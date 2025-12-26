import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { MultiTranslateHttpLoader } from './multi-translate-http-loader';

describe('MultiTranslateHttpLoader', () => {
  let loader: MultiTranslateHttpLoader;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpClient);
    loader = new MultiTranslateHttpLoader(http);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should merge error and ui translations', () =>
    new Promise<void>((done) => {
      loader.getTranslation('ja').subscribe((result) => {
        expect(result).toEqual({ ui: 'value', errorCodes: { ERROR: 'msg' } });
        done();
      });

      httpMock.expectOne('/i18n/error/ja.json').flush({ errorCodes: { ERROR: 'msg' } });
      httpMock.expectOne('/i18n/ui/ja.json').flush({ ui: 'value' });
    }));

  it('should return empty object when both requests fail', () =>
    new Promise<void>((done) => {
      loader.getTranslation('ja').subscribe((result) => {
        expect(result).toEqual({});
        done();
      });

      httpMock.expectOne('/i18n/error/ja.json').error(new ProgressEvent('error'));
      httpMock.expectOne('/i18n/ui/ja.json').error(new ProgressEvent('error'));
    }));

  it('should return partial translations when one request fails', () =>
    new Promise<void>((done) => {
      loader.getTranslation('ja').subscribe((result) => {
        expect(result).toEqual({ ui: 'value' });
        done();
      });

      httpMock.expectOne('/i18n/error/ja.json').error(new ProgressEvent('error'));
      httpMock.expectOne('/i18n/ui/ja.json').flush({ ui: 'value' });
    }));

  it('should request correct paths for different languages', () =>
    new Promise<void>((done) => {
      loader.getTranslation('en').subscribe((result) => {
        expect(result).toEqual({ hello: 'Hello' });
        done();
      });

      httpMock.expectOne('/i18n/error/en.json').flush({});
      httpMock.expectOne('/i18n/ui/en.json').flush({ hello: 'Hello' });
    }));
});
