import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

import { TagListComponent } from './tag-list';

describe('TagListComponent', () => {
  let component: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept tags input', () => {
    fixture.componentRef.setInput('tags', ['tag1', 'tag2']);
    fixture.detectChanges();

    expect(component.tags()).toEqual(['tag1', 'tag2']);
  });

  it('should emit tagClick event when onTagClick is called', () => {
    const tagClickSpy = vi.fn();
    component.tagClick.subscribe(tagClickSpy);

    component.onTagClick('test-tag');

    expect(tagClickSpy).toHaveBeenCalledWith('test-tag');
  });
});
