import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ErrorFacade } from './error.facade';
import { ClientError } from './error.model';
import { ClearError, ErrorState, ShowError } from './store';

describe('ErrorFacade', () => {
  let facade: ErrorFacade;
  let store: Store;

  const mockError: ClientError = {
    type: 'client',
    message: 'Test error message',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ErrorFacade, provideStore([ErrorState]), { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    facade = TestBed.inject(ErrorFacade);
    store = TestBed.inject(Store);
  });

  describe('showError', () => {
    it('should dispatch ShowError action on browser platform', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.showError(mockError);

      expect(dispatchSpy).toHaveBeenCalledWith(new ShowError(mockError));
    });

    it('should not dispatch ShowError action on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ErrorFacade, provideStore([ErrorState]), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverFacade = TestBed.inject(ErrorFacade);
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      serverFacade.showError(mockError);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('should dispatch ClearError action on browser platform', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.clearError();

      expect(dispatchSpy).toHaveBeenCalledWith(new ClearError());
    });

    it('should not dispatch ClearError action on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ErrorFacade, provideStore([ErrorState]), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverFacade = TestBed.inject(ErrorFacade);
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      serverFacade.clearError();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    it('should expose error$ selector', () => {
      expect(facade.error$).toBeDefined();
    });
  });
});
