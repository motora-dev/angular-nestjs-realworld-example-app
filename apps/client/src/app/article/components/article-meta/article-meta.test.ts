import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { Article } from '$domains/article';
import { ArticleMetaComponent } from './article-meta';

describe('ArticleMetaComponent', () => {
  let component: ArticleMetaComponent;
  let fixture: ComponentFixture<ArticleMetaComponent>;

  const mockArticle: Article = {
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
      bio: 'Test Bio',
      image: 'https://example.com/image.jpg',
      following: false,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleMetaComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleMetaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept article input', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();

    expect(component.article()).toEqual(mockArticle);
  });

  it('should accept canModify input', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.componentRef.setInput('canModify', true);
    fixture.detectChanges();

    expect(component.canModify()).toBe(true);
  });

  it('should default canModify to false', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();

    expect(component.canModify()).toBe(false);
  });

  it('should accept isDeleting input', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.componentRef.setInput('isDeleting', true);
    fixture.detectChanges();

    expect(component.isDeleting()).toBe(true);
  });

  it('should default isDeleting to false', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();

    expect(component.isDeleting()).toBe(false);
  });

  it('should emit favorite event when onFavorite is called', () => {
    const favoriteSpy = vi.fn();
    component.favorite.subscribe(favoriteSpy);

    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();

    component.onFavorite();

    expect(favoriteSpy).toHaveBeenCalled();
  });

  it('should emit delete event when onDelete is called', () => {
    const deleteSpy = vi.fn();
    component.delete.subscribe(deleteSpy);

    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();

    component.onDelete();

    expect(deleteSpy).toHaveBeenCalled();
  });

  it('should render article author username', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('testuser');
  });

  it('should render favorite button when canModify is false', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.componentRef.setInput('canModify', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const favoriteButton = compiled.querySelector('button');
    expect(favoriteButton).toBeTruthy();
  });

  it('should render edit and delete buttons when canModify is true', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.componentRef.setInput('canModify', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');
    const buttons = compiled.querySelectorAll('button');
    // Should have at least one link (edit) and one button (delete)
    expect(links.length).toBeGreaterThan(0);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should disable delete button when isDeleting is true', () => {
    fixture.componentRef.setInput('article', mockArticle);
    fixture.componentRef.setInput('canModify', true);
    fixture.componentRef.setInput('isDeleting', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector('button[disabled]');
    expect(deleteButton).toBeTruthy();
  });
});
