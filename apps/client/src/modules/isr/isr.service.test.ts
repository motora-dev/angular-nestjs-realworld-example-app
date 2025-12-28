import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { environment } from '$environments';
import { IsrService } from './isr.service';

describe('IsrService', () => {
  let service: IsrService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IsrService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    service = TestBed.inject(IsrService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('invalidateUrls', () => {
    it('should return null on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          IsrService,
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const serverService = TestBed.inject(IsrService);
      serverService.invalidateUrls(['/test']).subscribe((response) => {
        expect(response).toBeNull();
      });
    });

    it('should return null when urlsToInvalidate is empty', () => {
      service.invalidateUrls([]).subscribe((response) => {
        expect(response).toBeNull();
      });
    });

    it('should call invalidate-cache endpoint with URLs', () => {
      const mockResponse = { status: 'success' };
      service.invalidateUrls(['/article/123/456', '/article/789/012']).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/invalidate-cache`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        urlsToInvalidate: ['/article/123/456', '/article/789/012'],
      });
      req.flush(mockResponse);
    });
  });

  describe('invalidateArticlePage', () => {
    it('should invalidate single article page', () => {
      const mockResponse = { status: 'success' };
      service.invalidateArticlePage('article-id', 'page-id').subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/invalidate-cache`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        urlsToInvalidate: ['/article/article-id/page-id'],
      });
      req.flush(mockResponse);
    });
  });

  describe('invalidateArticlePages', () => {
    it('should invalidate multiple article pages', () => {
      const mockResponse = { status: 'success' };
      service.invalidateArticlePages('article-id', ['page-1', 'page-2', 'page-3']).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.baseUrl}/api/invalidate-cache`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        urlsToInvalidate: ['/article/article-id/page-1', '/article/article-id/page-2', '/article/article-id/page-3'],
      });
      req.flush(mockResponse);
    });
  });
});
