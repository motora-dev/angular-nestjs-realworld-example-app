import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SpinnerFacade } from '$modules/spinner';
import { EditorApi, ArticleResponse } from './api';
import { EditorFacade } from './editor.facade';
import { EditorArticle } from './model';
import { ClearEditorForm, EditorState, SetEditorForm } from './store';

describe('EditorFacade', () => {
  let facade: EditorFacade;
  let store: Store;
  let editorApi: EditorApi;
  let spinnerFacade: SpinnerFacade;

  const mockArticleResponse: ArticleResponse = {
    slug: 'test-slug',
    title: 'Test Article',
    description: 'Test Description',
    body: 'Test Body',
    tagList: ['test'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'testuser',
      bio: 'Test Bio',
      image: 'https://example.com/image.jpg',
      following: false,
    },
  };

  beforeEach(() => {
    const mockEditorApi = {
      get: vi.fn(() => of(mockArticleResponse)),
      create: vi.fn(() => of(mockArticleResponse)),
      update: vi.fn(() => of(mockArticleResponse)),
    };

    const mockSpinnerFacade = {
      withSpinner: vi.fn(() => (source: any) => source),
    };

    TestBed.configureTestingModule({
      providers: [
        EditorFacade,
        provideStore([EditorState]),
        { provide: EditorApi, useValue: mockEditorApi },
        { provide: SpinnerFacade, useValue: mockSpinnerFacade },
      ],
    });

    facade = TestBed.inject(EditorFacade);
    store = TestBed.inject(Store);
    editorApi = TestBed.inject(EditorApi);
    spinnerFacade = TestBed.inject(SpinnerFacade);
  });

  describe('loadArticle', () => {
    it('should load article and dispatch SetEditorForm action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.loadArticle('test-slug').subscribe((article) => {
        expect(article.slug).toBe('test-slug');
        expect(article.title).toBe('Test Article');
      });

      expect(editorApi.get).toHaveBeenCalledWith('test-slug');
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();
      setTimeout(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          new SetEditorForm({
            title: 'Test Article',
            description: 'Test Description',
            body: 'Test Body',
          }),
        );
      }, 100);
    });

    it('should map article response correctly', () => {
      facade.loadArticle('test-slug').subscribe((article) => {
        expect(article.createdAt).toBeInstanceOf(Date);
        expect(article.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('createArticle', () => {
    it('should create article and return mapped article', () => {
      const articleData: Partial<EditorArticle> = {
        title: 'New Article',
        description: 'New Description',
        body: 'New Body',
        tagList: ['new'],
      };

      facade.createArticle(articleData).subscribe((article) => {
        expect(article.slug).toBe('test-slug');
        expect(article.title).toBe('Test Article');
      });

      expect(editorApi.create).toHaveBeenCalledWith(articleData);
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();
    });
  });

  describe('updateArticle', () => {
    it('should update article and return mapped article', () => {
      const articleData: Partial<EditorArticle> = {
        slug: 'test-slug',
        title: 'Updated Article',
        description: 'Updated Description',
        body: 'Updated Body',
      };

      facade.updateArticle(articleData).subscribe((article) => {
        expect(article.slug).toBe('test-slug');
      });

      expect(editorApi.update).toHaveBeenCalledWith(articleData);
      expect(spinnerFacade.withSpinner).toHaveBeenCalled();
    });
  });

  describe('clearEditorForm', () => {
    it('should dispatch ClearEditorForm action', () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      facade.clearEditorForm();

      expect(dispatchSpy).toHaveBeenCalledWith(new ClearEditorForm());
    });
  });

  describe('selectors', () => {
    it('should expose isFormInvalid$ selector', () => {
      expect(facade.isFormInvalid$).toBeDefined();
    });

    it('should expose isFormDirty$ selector', () => {
      expect(facade.isFormDirty$).toBeDefined();
    });

    it('should expose formValue$ selector', () => {
      expect(facade.formValue$).toBeDefined();
    });
  });
});
