import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { EditorState } from '$domains/editor/store';
import { SpinnerFacade } from '$modules/spinner';
import { SpinnerState } from '$modules/spinner/store';
import { EditorFormComponent } from './editor-form';

describe('EditorFormComponent', () => {
  let component: EditorFormComponent;
  let fixture: ComponentFixture<EditorFormComponent>;
  let mockSpinnerFacade: {
    isLoading$: BehaviorSubject<boolean>;
  };

  beforeEach(async () => {
    mockSpinnerFacade = {
      isLoading$: new BehaviorSubject<boolean>(false),
    };

    await TestBed.configureTestingModule({
      imports: [EditorFormComponent],
      providers: [provideStore([EditorState, SpinnerState]), { provide: SpinnerFacade, useValue: mockSpinnerFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default tagList to empty array', () => {
    expect(component.articleForm.controls.tagList.value).toEqual([]);
  });

  describe('articleForm', () => {
    it('should be invalid initially', () => {
      expect(component.articleForm.invalid).toBe(true);
    });

    it('should be valid with valid inputs', () => {
      component.articleForm.patchValue({
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
      });

      expect(component.articleForm.valid).toBe(true);
    });

    it('should require title', () => {
      component.articleForm.patchValue({
        title: '',
        description: 'Test Description',
        body: 'Test Body',
      });

      expect(component.articleForm.controls.title.hasError('required')).toBe(true);
    });

    it('should require description', () => {
      component.articleForm.patchValue({
        title: 'Test Title',
        description: '',
        body: 'Test Body',
      });

      expect(component.articleForm.controls.description.hasError('required')).toBe(true);
    });

    it('should require body', () => {
      component.articleForm.patchValue({
        title: 'Test Title',
        description: 'Test Description',
        body: '',
      });

      expect(component.articleForm.controls.body.hasError('required')).toBe(true);
    });
  });

  describe('addTag', () => {
    it('should add tag to tagList', () => {
      component.tagField.setValue('newtag');
      component.addTag();

      expect(component.articleForm.controls.tagList.value).toContain('newtag');
      expect(component.tagField.value).toBe('');
    });

    it('should not add duplicate tag', () => {
      component.articleForm.controls.tagList.setValue(['existing']);
      component.tagField.setValue('existing');
      component.addTag();

      expect(component.articleForm.controls.tagList.value).toEqual(['existing']);
    });

    it('should trim tag before adding', () => {
      component.tagField.setValue('  trimmed  ');
      component.addTag();

      expect(component.articleForm.controls.tagList.value).toContain('trimmed');
    });

    it('should not add empty tag', () => {
      component.tagField.setValue('   ');
      component.addTag();

      expect(component.articleForm.controls.tagList.value).toEqual([]);
    });
  });

  describe('removeTag', () => {
    it('should remove tag from tagList', () => {
      component.articleForm.controls.tagList.setValue(['tag1', 'tag2', 'tag3']);
      component.removeTag('tag2');

      expect(component.articleForm.controls.tagList.value).toEqual(['tag1', 'tag3']);
    });

    it('should do nothing if tag does not exist', () => {
      component.articleForm.controls.tagList.setValue(['tag1', 'tag2']);
      component.removeTag('tag3');

      expect(component.articleForm.controls.tagList.value).toEqual(['tag1', 'tag2']);
    });
  });

  describe('onSubmit', () => {
    it('should not submit if form is invalid', () => {
      const emitSpy = vi.spyOn(component.formSubmit, 'emit');

      component.onSubmit();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should emit formSubmit event with form data and tagList when form is valid', () => {
      const emitSpy = vi.spyOn(component.formSubmit, 'emit');
      component.articleForm.controls.tagList.setValue(['tag1', 'tag2']);

      component.articleForm.patchValue({
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
      });

      component.onSubmit();

      expect(emitSpy).toHaveBeenCalledWith({
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
        tagList: ['tag1', 'tag2'],
      });
    });

    it('should add tag from tagField before submitting', () => {
      const emitSpy = vi.spyOn(component.formSubmit, 'emit');
      component.articleForm.controls.tagList.setValue(['existing']);
      component.tagField.setValue('newtag');

      component.articleForm.patchValue({
        title: 'Test Title',
        description: 'Test Description',
        body: 'Test Body',
      });

      component.onSubmit();

      expect(component.articleForm.controls.tagList.value).toContain('newtag');
      expect(emitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          tagList: expect.arrayContaining(['existing', 'newtag']),
        }),
      );
    });
  });

  describe('isLoading$', () => {
    it('should expose isLoading$ from spinnerFacade', () => {
      let isLoading = false;
      component.isLoading$.subscribe((value) => {
        isLoading = value;
      });

      expect(isLoading).toBe(false);

      mockSpinnerFacade.isLoading$.next(true);
      expect(isLoading).toBe(true);
    });
  });
});
