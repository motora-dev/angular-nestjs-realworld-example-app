import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { HideSnackbar, ShowSnackbar } from './snackbar.actions';
import { SnackbarState } from './snackbar.state';

describe('SnackbarState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([SnackbarState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have empty items array as initial state', () => {
      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars).toEqual([]);
    });
  });

  describe('getSnackbars selector', () => {
    it('should return empty array when no snackbars', () => {
      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars).toEqual([]);
    });

    it('should return snackbars when set', () => {
      store.dispatch(new ShowSnackbar('Test message', 'info'));

      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars).toHaveLength(1);
      expect(snackbars[0].message).toBe('Test message');
      expect(snackbars[0].type).toBe('info');
    });
  });

  describe('ShowSnackbar action', () => {
    it('should add snackbar to items array', () => {
      store.dispatch(new ShowSnackbar('Test message', 'info'));

      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars).toHaveLength(1);
      expect(snackbars[0].message).toBe('Test message');
      expect(snackbars[0].type).toBe('info');
      expect(snackbars[0].duration).toBe(3000);
      expect(snackbars[0].id).toBeDefined();
      expect(snackbars[0].createdAt).toBeDefined();
    });

    it('should use provided id when given', () => {
      store.dispatch(new ShowSnackbar('Test message', 'info', 3000, 'custom-id'));

      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars[0].id).toBe('custom-id');
    });

    it('should generate id when not provided', () => {
      store.dispatch(new ShowSnackbar('Test message', 'info'));

      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars[0].id).toMatch(/^snackbar-/);
    });

    it('should add multiple snackbars', () => {
      store.dispatch(new ShowSnackbar('Message 1', 'info'));
      store.dispatch(new ShowSnackbar('Message 2', 'success'));

      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars).toHaveLength(2);
      expect(snackbars[0].message).toBe('Message 1');
      expect(snackbars[1].message).toBe('Message 2');
    });
  });

  describe('HideSnackbar action', () => {
    it('should remove snackbar from items array', () => {
      store.dispatch(new ShowSnackbar('Message 1', 'info', 3000, 'id-1'));
      store.dispatch(new ShowSnackbar('Message 2', 'success', 3000, 'id-2'));
      store.dispatch(new HideSnackbar('id-1'));

      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars).toHaveLength(1);
      expect(snackbars[0].id).toBe('id-2');
    });

    it('should not remove snackbar if id does not match', () => {
      store.dispatch(new ShowSnackbar('Message 1', 'info', 3000, 'id-1'));
      store.dispatch(new HideSnackbar('non-existent-id'));

      const snackbars = store.selectSnapshot(SnackbarState.getSnackbars);
      expect(snackbars).toHaveLength(1);
    });
  });
});
