import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ErrorFacade } from '$modules/error';
import { NotFoundError } from '$modules/error/client-errors';
import { ClientErrorHandler } from './client-error.handler';

describe('ClientErrorHandler', () => {
  let handler: ClientErrorHandler;
  let router: Router;
  let errorFacade: ErrorFacade;

  beforeEach(() => {
    const mockRouter = {
      navigate: vi.fn(),
    };

    const mockErrorFacade = {
      showError: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ClientErrorHandler,
        { provide: Router, useValue: mockRouter },
        { provide: ErrorFacade, useValue: mockErrorFacade },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    handler = TestBed.inject(ClientErrorHandler);
    router = TestBed.inject(Router);
    errorFacade = TestBed.inject(ErrorFacade);
  });

  describe('handleError', () => {
    it('should skip processing in SSR environment', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ClientErrorHandler,
          { provide: Router, useValue: router },
          { provide: ErrorFacade, useValue: errorFacade },
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });

      const serverHandler = TestBed.inject(ClientErrorHandler);
      const error = new Error('Test error');
      serverHandler.handleError(error);

      expect(router.navigate).not.toHaveBeenCalled();
      expect(errorFacade.showError).not.toHaveBeenCalled();
    });

    it('should navigate to 401 error page for HttpErrorResponse 401', () => {
      const error = new HttpErrorResponse({ status: 401 });
      handler.handleError(error);

      expect(router.navigate).toHaveBeenCalledWith(['/error/401'], { skipLocationChange: true });
      expect(errorFacade.showError).not.toHaveBeenCalled();
    });

    it('should navigate to 403 error page for HttpErrorResponse 403', () => {
      const error = new HttpErrorResponse({ status: 403 });
      handler.handleError(error);

      expect(router.navigate).toHaveBeenCalledWith(['/error/403'], { skipLocationChange: true });
      expect(errorFacade.showError).not.toHaveBeenCalled();
    });

    it('should navigate to 404 error page for HttpErrorResponse 404', () => {
      const error = new HttpErrorResponse({ status: 404 });
      handler.handleError(error);

      expect(router.navigate).toHaveBeenCalledWith(['/error/404'], { skipLocationChange: true });
      expect(errorFacade.showError).not.toHaveBeenCalled();
    });

    it('should skip processing for other HttpErrorResponse status codes', () => {
      const error = new HttpErrorResponse({ status: 500 });
      handler.handleError(error);

      expect(router.navigate).not.toHaveBeenCalled();
      expect(errorFacade.showError).not.toHaveBeenCalled();
    });

    it('should navigate to 404 error page for NotFoundError', () => {
      const error = new NotFoundError('Resource not found');
      handler.handleError(error);

      expect(router.navigate).toHaveBeenCalledWith(['/error/404'], { skipLocationChange: true });
      expect(errorFacade.showError).not.toHaveBeenCalled();
    });

    it('should display error dialog for Error instance', () => {
      const error = new Error('Test error message');
      handler.handleError(error);

      expect(router.navigate).not.toHaveBeenCalled();
      expect(errorFacade.showError).toHaveBeenCalledWith({
        type: 'client',
        message: 'Test error message',
      });
    });

    it('should display error dialog with default message for non-Error instance', () => {
      const error = 'String error';
      handler.handleError(error);

      expect(router.navigate).not.toHaveBeenCalled();
      expect(errorFacade.showError).toHaveBeenCalledWith({
        type: 'client',
        message: expect.any(String),
      });
    });
  });
});
