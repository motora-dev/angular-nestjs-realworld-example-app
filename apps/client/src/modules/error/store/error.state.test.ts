import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { ClientError, ServerError } from '../error.model';
import { ClearError, ShowError } from './error.actions';
import { ErrorState } from './error.state';

describe('ErrorState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([ErrorState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have null error as initial state', () => {
      const error = store.selectSnapshot(ErrorState.error);
      expect(error).toBeNull();
    });
  });

  describe('error selector', () => {
    it('should return null when error is not set', () => {
      const error = store.selectSnapshot(ErrorState.error);
      expect(error).toBeNull();
    });

    it('should return error when set', () => {
      const mockError: ClientError = {
        type: 'client',
        message: 'Test error message',
      };

      store.dispatch(new ShowError(mockError));

      const error = store.selectSnapshot(ErrorState.error);
      expect(error).toEqual(mockError);
    });
  });

  describe('ShowError action', () => {
    it('should set client error in state', () => {
      const mockError: ClientError = {
        type: 'client',
        message: 'Test error message',
      };

      store.dispatch(new ShowError(mockError));

      const error = store.selectSnapshot(ErrorState.error);
      expect(error).toEqual(mockError);
    });

    it('should set server error in state', () => {
      const mockError: ServerError = {
        type: 'server',
        status: 500,
        message: 'Internal Server Error',
      };

      store.dispatch(new ShowError(mockError));

      const error = store.selectSnapshot(ErrorState.error);
      expect(error).toEqual(mockError);
    });
  });

  describe('ClearError action', () => {
    it('should clear error from state', () => {
      const mockError: ClientError = {
        type: 'client',
        message: 'Test error message',
      };

      store.dispatch(new ShowError(mockError));
      store.dispatch(new ClearError());

      const error = store.selectSnapshot(ErrorState.error);
      expect(error).toBeNull();
    });
  });
});
