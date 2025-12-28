import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';

import { Article } from '$domains/article';
import { ArticleListComponent } from './article-list';

describe('ArticleListComponent', () => {
  let component: ArticleListComponent;
  let fixture: ComponentFixture<ArticleListComponent>;

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
      bio: '',
      image: '',
      following: false,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleListComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept articles input', () => {
    fixture.componentRef.setInput('articles', [mockArticle]);
    fixture.detectChanges();

    expect(component.articles()).toEqual([mockArticle]);
  });
});
