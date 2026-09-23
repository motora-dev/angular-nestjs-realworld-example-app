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
      const form = store.selectSnapshot((state) => state.editor.editorForm);
      expect(form).toEqual({
        model: {
          title: '',
          description: '',
          body: '',
          tagList: [],
        },
        dirty: false,
        status: '',
        errors: {},
      });
    });
  });

  describe('SetEditorForm action', () => {
    it('should set editor form in state', () => {
      const mockForm: EditorFormModel = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
      };

      store.dispatch(new SetEditorForm(mockForm));

      const form = store.selectSnapshot((state) => state.editor.editorForm);
      expect(form.model).toEqual(mockForm);
      expect(form.dirty).toBe(false);
    });
  });

  describe('ClearEditorForm action', () => {
    it('should reset editor form to default state', () => {
      const mockForm: EditorFormModel = {
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['test'],
      };

      store.dispatch(new SetEditorForm(mockForm));
      store.dispatch(new ClearEditorForm());

      const formValue = store.selectSnapshot((state) => state.editor.editorForm.model);
      expect(formValue).toEqual({
        title: '',
        description: '',
        body: '',
        tagList: [],
      });
    });
  });
});
