import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, vi } from 'vitest';

import { CommentsState } from '$domains/article/store';
import { CommentFormComponent } from './comment-form';

describe('CommentFormComponent', () => {
  let component: CommentFormComponent;
  let fixture: ComponentFixture<CommentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentFormComponent],
      providers: [provideStore([CommentsState])],
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

  it('should disable submit button when form is invalid', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton?.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', async () => {
    fixture.detectChanges();

    const bodyControl = component.commentForm.get('body');
    bodyControl?.setValue('Valid comment');
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton?.disabled).toBe(false);
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
});
