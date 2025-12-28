import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SpinnerFacade } from './spinner.facade';
import { HideSpinner, ShowSpinner, SpinnerState } from './store';

describe('SpinnerFacade', () => {
  let facade: SpinnerFacade;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpinnerFacade, provideStore([SpinnerState]), { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    facade = TestBed.inject(SpinnerFacade);
    store = TestBed.inject(Store);
  });

  describe('showSpinner', () => {
    it('should dispatch ShowSpinner action on browser platform', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.showSpinner('Loading...');

      expect(dispatchSpy).toHaveBeenCalledWith(new ShowSpinner('Loading...'));
    });

    it('should dispatch ShowSpinner action without message', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.showSpinner();

      expect(dispatchSpy).toHaveBeenCalledWith(new ShowSpinner());
    });

    it('should not dispatch ShowSpinner action on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [SpinnerFacade, provideStore([SpinnerState]), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverFacade = TestBed.inject(SpinnerFacade);
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      serverFacade.showSpinner();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('hideSpinner', () => {
    it('should dispatch HideSpinner action on browser platform', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.hideSpinner();

      expect(dispatchSpy).toHaveBeenCalledWith(new HideSpinner());
    });

    it('should not dispatch HideSpinner action on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [SpinnerFacade, provideStore([SpinnerState]), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverFacade = TestBed.inject(SpinnerFacade);
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      serverFacade.hideSpinner();

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('withSpinner', () => {
    it('should show and hide spinner automatically on browser platform', async () => {
      const showSpinnerSpy = vi.spyOn(facade, 'showSpinner');
      const hideSpinnerSpy = vi.spyOn(facade, 'hideSpinner');
      const source = of('test data');

      source.pipe(facade.withSpinner('Loading...')).subscribe({
        next: (data) => {
          expect(data).toBe('test data');
        },
        complete: async () => {
          expect(showSpinnerSpy).toHaveBeenCalledWith('Loading...');
          await new Promise((resolve) => setTimeout(resolve, 400));
          expect(hideSpinnerSpy).toHaveBeenCalled();
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    it('should not control spinner on server platform', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [SpinnerFacade, provideStore([SpinnerState]), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverFacade = TestBed.inject(SpinnerFacade);
      const showSpinnerSpy = vi.spyOn(serverFacade, 'showSpinner');
      const hideSpinnerSpy = vi.spyOn(serverFacade, 'hideSpinner');
      const source = of('test data');

      source.pipe(serverFacade.withSpinner('Loading...')).subscribe({
        next: (data) => {
          expect(data).toBe('test data');
        },
        complete: () => {
          expect(showSpinnerSpy).toHaveBeenCalledWith('Loading...');
          expect(hideSpinnerSpy).not.toHaveBeenCalled();
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  });

  describe('selectors', () => {
    it('should expose isLoading$ selector', () => {
      expect(facade.isLoading$).toBeDefined();
    });

    it('should expose message$ selector', () => {
      expect(facade.message$).toBeDefined();
    });
  });
});
