import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { Comment } from '$domains/article';
import { ArticleCommentComponent } from './article-comment';

describe('ArticleCommentComponent', () => {
  let component: ArticleCommentComponent;
  let fixture: ComponentFixture<ArticleCommentComponent>;

  const mockComment: Comment = {
    id: '1',
    body: 'Test Comment Body',
    createdAt: new Date('2024-01-01'),
    author: {
      username: 'commenter',
      bio: 'Commenter Bio',
      image: 'https://example.com/commenter.jpg',
      following: false,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCommentComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCommentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept comment input', () => {
    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();

    expect(component.comment()).toEqual(mockComment);
  });

  it('should accept canDelete input', () => {
    fixture.componentRef.setInput('comment', mockComment);
    fixture.componentRef.setInput('canDelete', true);
    fixture.detectChanges();

    expect(component.canDelete()).toBe(true);
  });

  it('should default canDelete to false', () => {
    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();

    expect(component.canDelete()).toBe(false);
  });

  it('should emit delete event when onDelete is called', () => {
    const deleteSpy = vi.fn();
    component.delete.subscribe(deleteSpy);

    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();

    component.onDelete();

    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should render comment body', () => {
    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Comment Body');
  });

  it('should render comment author username', () => {
    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('commenter');
  });

  it('should render delete button when canDelete is true', () => {
    fixture.componentRef.setInput('comment', mockComment);
    fixture.componentRef.setInput('canDelete', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector('button');
    expect(deleteButton).toBeTruthy();
  });

  it('should not render delete button when canDelete is false', () => {
    fixture.componentRef.setInput('comment', mockComment);
    fixture.componentRef.setInput('canDelete', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector('button');
    expect(deleteButton).toBeFalsy();
  });
});
