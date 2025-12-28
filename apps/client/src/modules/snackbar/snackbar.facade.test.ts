import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SnackbarFacade } from './snackbar.facade';
import { HideSnackbar, ShowSnackbar, SnackbarState } from './store';

describe('SnackbarFacade', () => {
  let facade: SnackbarFacade;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SnackbarFacade, provideStore([SnackbarState]), { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    facade = TestBed.inject(SnackbarFacade);
    store = TestBed.inject(Store);
  });

  describe('showSnackbar', () => {
    it('should dispatch ShowSnackbar action with default type and duration', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.showSnackbar('info', 'Test message');

      expect(dispatchSpy).toHaveBeenCalledWith(new ShowSnackbar('Test message', 'info', 3000));
    });

    it('should dispatch ShowSnackbar action with custom type and duration', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.showSnackbar('success', 'Success message', 5000);

      expect(dispatchSpy).toHaveBeenCalledWith(new ShowSnackbar('Success message', 'success', 5000));
    });

    it('should not dispatch ShowSnackbar action on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [SnackbarFacade, provideStore([SnackbarState]), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverFacade = TestBed.inject(SnackbarFacade);
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      serverFacade.showSnackbar('info', 'Test message');

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('hideSnackbar', () => {
    it('should dispatch HideSnackbar action on browser platform', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.hideSnackbar('test-id');

      expect(dispatchSpy).toHaveBeenCalledWith(new HideSnackbar('test-id'));
    });

    it('should not dispatch HideSnackbar action on server platform', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [SnackbarFacade, provideStore([SnackbarState]), { provide: PLATFORM_ID, useValue: 'server' }],
      });

      const serverFacade = TestBed.inject(SnackbarFacade);
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      serverFacade.hideSnackbar('test-id');

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('selectors', () => {
    it('should expose snackbars$ selector', () => {
      expect(facade.snackbars$).toBeDefined();
    });
  });
});
