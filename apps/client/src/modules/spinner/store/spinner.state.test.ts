import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { HideSpinner, ShowSpinner } from './spinner.actions';
import { SpinnerState } from './spinner.state';

describe('SpinnerState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([SpinnerState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have zero loadingCount as initial state', () => {
      const isLoading = store.selectSnapshot(SpinnerState.isLoading);
      expect(isLoading).toBe(false);
    });

    it('should have null message as initial state', () => {
      const message = store.selectSnapshot(SpinnerState.getMessage);
      expect(message).toBeNull();
    });
  });

  describe('isLoading selector', () => {
    it('should return false when loadingCount is 0', () => {
      const isLoading = store.selectSnapshot(SpinnerState.isLoading);
      expect(isLoading).toBe(false);
    });

    it('should return true when loadingCount is greater than 0', () => {
      store.dispatch(new ShowSpinner());

      const isLoading = store.selectSnapshot(SpinnerState.isLoading);
      expect(isLoading).toBe(true);
    });
  });

  describe('getMessage selector', () => {
    it('should return null when message is not set', () => {
      const message = store.selectSnapshot(SpinnerState.getMessage);
      expect(message).toBeNull();
    });

    it('should return message when set', () => {
      store.dispatch(new ShowSpinner('Loading...'));

      const message = store.selectSnapshot(SpinnerState.getMessage);
      expect(message).toBe('Loading...');
    });
  });

  describe('ShowSpinner action', () => {
    it('should increment loadingCount', () => {
      store.dispatch(new ShowSpinner());
      store.dispatch(new ShowSpinner());

      const isLoading = store.selectSnapshot(SpinnerState.isLoading);
      expect(isLoading).toBe(true);
    });

    it('should set message when provided', () => {
      store.dispatch(new ShowSpinner('Loading...'));

      const message = store.selectSnapshot(SpinnerState.getMessage);
      expect(message).toBe('Loading...');
    });

    it('should keep existing message when not provided', () => {
      store.dispatch(new ShowSpinner('Initial message'));
      store.dispatch(new ShowSpinner());

      const message = store.selectSnapshot(SpinnerState.getMessage);
      expect(message).toBe('Initial message');
    });
  });

  describe('HideSpinner action', () => {
    it('should decrement loadingCount', () => {
      store.dispatch(new ShowSpinner());
      store.dispatch(new ShowSpinner());
      store.dispatch(new HideSpinner());

      const isLoading = store.selectSnapshot(SpinnerState.isLoading);
      expect(isLoading).toBe(true);
    });

    it('should set loadingCount to 0 when decremented below 0', () => {
      store.dispatch(new HideSpinner());

      const isLoading = store.selectSnapshot(SpinnerState.isLoading);
      expect(isLoading).toBe(false);
    });

    it('should clear message when loadingCount reaches 0', () => {
      store.dispatch(new ShowSpinner('Loading...'));
      store.dispatch(new HideSpinner());

      const message = store.selectSnapshot(SpinnerState.getMessage);
      expect(message).toBeNull();
    });

    it('should keep message when loadingCount is still greater than 0', () => {
      store.dispatch(new ShowSpinner('Loading...'));
      store.dispatch(new ShowSpinner());
      store.dispatch(new HideSpinner());

      const message = store.selectSnapshot(SpinnerState.getMessage);
      expect(message).toBe('Loading...');
    });
  });
});
