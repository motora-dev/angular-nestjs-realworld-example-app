import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { ArticleFacade } from '$domains/article';
import { CommentsState } from '$domains/article/store';
import { CommentFormComponent } from './comment-form';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;

  beforeEach(async () => {
    const mockArticleFacade = {
      isCommentFormInvalid$: of(true),
    };

    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [provideStore([CommentsState]), { provide: ArticleFacade, useValue: mockArticleFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept userImage input', () => {
    fixture.componentRef.setInput('userImage', 'https://example.com/image.jpg');
    fixture.detectChanges();

    expect(component.userImage()).toBe('https://example.com/image.jpg');
  });

  it('should default userImage to empty string', () => {
    fixture.detectChanges();

    expect(component.userImage()).toBe('');
  });

  it('should accept userName input', () => {
    fixture.componentRef.setInput('userName', 'testuser');
    fixture.detectChanges();

    expect(component.userName()).toBe('testuser');
  });

  it('should default userName to empty string', () => {
    fixture.detectChanges();

    expect(component.userName()).toBe('');
  });

  it('should initialize form with empty body', () => {
    fixture.detectChanges();

    expect(component.commentForm.get('body')?.value).toBe('');
  });

  it('should have required validator on body field', () => {
    fixture.detectChanges();

    const bodyControl = component.commentForm.get('body');
    expect(bodyControl?.hasError('required')).toBe(true);
  });

  it('should have pattern validator on body field', () => {
    fixture.detectChanges();

    const bodyControl = component.commentForm.get('body');
    bodyControl?.setValue('   ');
    expect(bodyControl?.hasError('pattern')).toBe(true);
  });

  it('should emit submitComment event with trimmed body when form is submitted', () => {
    const submitSpy = vi.fn();
    component.submitComment.subscribe(submitSpy);

    fixture.detectChanges();

    const bodyControl = component.commentForm.get('body');
    bodyControl?.setValue('  Test Comment  ');
    component.onSubmit();

    expect(submitSpy).toHaveBeenCalledWith('Test Comment');
  });

  it('should subscribe to isCommentFormInvalid$ from facade', async () => {
    const mockFacade = {
      isCommentFormInvalid$: of(true),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [provideStore([CommentsState]), { provide: ArticleFacade, useValue: mockFacade }],
    }).compileComponents();

    const newFixture = TestBed.createComponent(CommentFormComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    const isInvalid = await new Promise<boolean>((resolve) => {
      newComponent.isFormInvalid$?.subscribe((invalid) => resolve(invalid));
    });
    expect(isInvalid).toBe(true);
  });

  it('should render form with textarea', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const textarea = compiled.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('should render submit button', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
  });

  it('should disable submit button when form is invalid', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    // Form is invalid (empty body) and isFormInvalid$ is true
    expect(submitButton?.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', async () => {
    // Create a new test module with valid form state
    const mockArticleFacade = {
      isCommentFormInvalid$: of(false),
    };

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [provideStore([CommentsState]), { provide: ArticleFacade, useValue: mockArticleFacade }],
    }).compileComponents();

    const newFixture = TestBed.createComponent(CommentFormComponent);
    const newComponent = newFixture.componentInstance;

    newFixture.detectChanges();

    const bodyControl = newComponent.commentForm.get('body');
    bodyControl?.setValue('Valid comment');
    newFixture.detectChanges();
    await newFixture.whenStable();

    const compiled = newFixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton?.disabled).toBe(false);
  });
});
