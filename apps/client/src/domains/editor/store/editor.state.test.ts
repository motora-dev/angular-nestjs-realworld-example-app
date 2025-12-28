import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { ClearEditorForm, SetEditorForm } from './editor.actions';
import { EditorFormModel } from '../model';
import { EditorState } from './editor.state';

describe('EditorState', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([EditorState])],
    });

    store = TestBed.inject(Store);
  });

  describe('initial state', () => {
    it('should have default editor form as initial state', () => {
      const formValue = store.selectSnapshot(EditorState.getFormValue);
      expect(formValue).toEqual({
        title: '',
        description: '',
        body: '',
      });
    });

    it('should have invalid form status as initial state', () => {
      const isInvalid = store.selectSnapshot(EditorState.isFormInvalid);
      expect(isInvalid).toBe(true);
    });

    it('should have non-dirty form as initial state', () => {
      const isDirty = store.selectSnapshot(EditorState.isFormDirty);
      expect(isDirty).toBe(false);
    });
  });

  describe('isFormInvalid selector', () => {
    it('should return true when form status is not VALID', () => {
      const isInvalid = store.selectSnapshot(EditorState.isFormInvalid);
      expect(isInvalid).toBe(true);
    });
  });

  describe('isFormDirty selector', () => {
    it('should return false when form is not dirty', () => {
      const isDirty = store.selectSnapshot(EditorState.isFormDirty);
      expect(isDirty).toBe(false);
    });
  });

  describe('getFormValue selector', () => {
    it('should return form value from state', () => {
      const mockForm: EditorFormModel = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
      };

      store.dispatch(new SetEditorForm(mockForm));

      const formValue = store.selectSnapshot(EditorState.getFormValue);
      expect(formValue).toEqual(mockForm);
    });
  });

  describe('SetEditorForm action', () => {
    it('should set editor form in state', () => {
      const mockForm: EditorFormModel = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
      };

      store.dispatch(new SetEditorForm(mockForm));

      const formValue = store.selectSnapshot(EditorState.getFormValue);
      expect(formValue).toEqual(mockForm);
    });

    it('should set dirty to false when form is set', () => {
      const mockForm: EditorFormModel = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
      };

      store.dispatch(new SetEditorForm(mockForm));

      const isDirty = store.selectSnapshot(EditorState.isFormDirty);
      expect(isDirty).toBe(false);
    });
  });

  describe('ClearEditorForm action', () => {
    it('should reset editor form to default state', () => {
      const mockForm: EditorFormModel = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
      };

      store.dispatch(new SetEditorForm(mockForm));
      store.dispatch(new ClearEditorForm());

      const formValue = store.selectSnapshot(EditorState.getFormValue);
      expect(formValue).toEqual({
        title: '',
        description: '',
        body: '',
      });
    });
  });
});
