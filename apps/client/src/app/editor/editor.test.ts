import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { EditorArticle, EditorFacade } from '$domains/editor';
import { EditorState } from '$domains/editor/store';
import { SpinnerState } from '$modules/spinner/store';
import { API_URL } from '$shared/lib';
import { EditorComponent } from './editor';

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;
  let mockEditorFacade: {
    loadArticle: ReturnType<typeof vi.fn>;
    createArticle: ReturnType<typeof vi.fn>;
    updateArticle: ReturnType<typeof vi.fn>;
  };
  let mockRouter: {
    navigate: ReturnType<typeof vi.fn>;
  };

  const mockArticle: EditorArticle = {
    slug: 'test-slug',
    title: 'Test Article',
    description: 'Test Description',
    body: 'Test Body',
    tagList: ['test'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    favorited: false,
    favoritesCount: 0,
    author: {
      username: 'testuser',
      bio: '',
      image: '',
      following: false,
    },
  };

  beforeEach(async () => {
    mockEditorFacade = {
      loadArticle: vi.fn(() => of(mockArticle)),
      createArticle: vi.fn(() => of(mockArticle)),
      updateArticle: vi.fn(() => of(mockArticle)),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    const mockActivatedRoute = {
      snapshot: {
        params: {},
      },
    };

    await TestBed.configureTestingModule({
      imports: [EditorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideStore([EditorState, SpinnerState]),
        { provide: EditorFacade, useValue: mockEditorFacade },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: API_URL, useValue: 'http://localhost:3000' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be in edit mode when slug is not provided', () => {
    expect(component.isEditMode()).toBe(false);
    expect(component.initialTagList()).toEqual([]);
    expect(mockEditorFacade.loadArticle).not.toHaveBeenCalled();
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      const mockActivatedRouteWithSlug = {
        snapshot: {
          params: {
            slug: 'test-slug',
          },
        },
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [EditorComponent],
        providers: [
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
          provideStore([EditorState, SpinnerState]),
          { provide: EditorFacade, useValue: mockEditorFacade },
          { provide: Router, useValue: mockRouter },
          { provide: ActivatedRoute, useValue: mockActivatedRouteWithSlug },
          { provide: API_URL, useValue: 'http://localhost:3000' },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(EditorComponent);
      component = fixture.componentInstance;
    });

    it('should be in edit mode when slug is provided', () => {
      expect(component.isEditMode()).toBe(true);
    });

    it('should load article when slug is provided', async () => {
      expect(mockEditorFacade.loadArticle).toHaveBeenCalledWith('test-slug');

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(component.initialTagList()).toEqual(['test']);
    });
  });

  describe('onFormSubmit', () => {
    it('should call createArticle and navigate when not in edit mode', async () => {
      const event = {
        title: 'New Article',
        description: 'New Description',
        body: 'New Body',
        tagList: ['tag1'],
      };

      component.onFormSubmit(event);

      expect(mockEditorFacade.createArticle).toHaveBeenCalledWith({
        title: 'New Article',
        description: 'New Description',
        body: 'New Body',
        tagList: ['tag1'],
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/article', 'test-slug']);
    });

    it('should call updateArticle and navigate when in edit mode', async () => {
      // Set edit mode
      component['slug'] = 'test-slug';
      component.isEditMode.set(true);

      const event = {
        title: 'Updated Article',
        description: 'Updated Description',
        body: 'Updated Body',
        tagList: ['tag1', 'tag2'],
      };

      component.onFormSubmit(event);

      expect(mockEditorFacade.updateArticle).toHaveBeenCalledWith({
        title: 'Updated Article',
        description: 'Updated Description',
        body: 'Updated Body',
        tagList: ['tag1', 'tag2'],
        slug: 'test-slug',
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/article', 'test-slug']);
    });
  });
});
