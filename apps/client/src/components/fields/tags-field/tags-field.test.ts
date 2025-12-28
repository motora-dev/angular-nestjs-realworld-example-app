import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { SpinnerState } from '$modules/spinner/store';
import { TagsFieldComponent } from './tags-field';

describe('TagsFieldComponent', () => {
  let component: TagsFieldComponent;
  let fixture: ComponentFixture<TagsFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsFieldComponent, ReactiveFormsModule],
      providers: [provideStore([SpinnerState])],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor', () => {
    it('should implement ControlValueAccessor', () => {
      expect(component.writeValue).toBeDefined();
      expect(component.registerOnChange).toBeDefined();
      expect(component.registerOnTouched).toBeDefined();
      expect(component.setDisabledState).toBeDefined();
    });

    it('should write value to tags', () => {
      const tags = ['tag1', 'tag2'];
      component.writeValue(tags);
      expect(component.tags()).toEqual(tags);
    });

    it('should handle null value', () => {
      component.writeValue(null as unknown as string[]);
      expect(component.tags()).toEqual([]);
    });

    it('should register onChange callback', () => {
      const onChange = vi.fn();
      component.registerOnChange(onChange);
      component.writeValue(['tag1']);
      component['onChange'](['tag1']);
      expect(onChange).toHaveBeenCalledWith(['tag1']);
    });

    it('should register onTouched callback', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);
      component.handleBlur();
      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe('addTag', () => {
    it('should add a tag', () => {
      component.inputValue.set('newtag');
      component.addTag();
      expect(component.tags()).toContain('newtag');
      expect(component.inputValue()).toBe('');
    });

    it('should not add empty tag', () => {
      component.inputValue.set('');
      const initialTags = component.tags();
      component.addTag();
      expect(component.tags()).toEqual(initialTags);
    });

    it('should not add duplicate tag', () => {
      component.tags.set(['existingtag']);
      component.inputValue.set('existingtag');
      component.addTag();
      expect(component.tags()).toEqual(['existingtag']);
    });

    it('should trim whitespace from tags', () => {
      component.inputValue.set('  trimmedtag  ');
      component.addTag();
      expect(component.tags()).toContain('trimmedtag');
    });

    it('should handle comma-separated tags', () => {
      component.inputValue.set('tag1,tag2,tag3');
      component.addTag();
      expect(component.tags()).toContain('tag1');
      expect(component.tags()).toContain('tag2');
      expect(component.tags()).toContain('tag3');
    });

    it('should filter out empty tags from comma-separated input', () => {
      component.inputValue.set('tag1,,tag2, ,tag3');
      component.addTag();
      expect(component.tags()).not.toContain('');
      expect(component.tags()).toContain('tag1');
      expect(component.tags()).toContain('tag2');
      expect(component.tags()).toContain('tag3');
    });
  });

  describe('removeTag', () => {
    it('should remove a tag', () => {
      component.tags.set(['tag1', 'tag2', 'tag3']);
      component.removeTag('tag2');
      expect(component.tags()).toEqual(['tag1', 'tag3']);
    });

    it('should do nothing if tag not found', () => {
      component.tags.set(['tag1', 'tag2']);
      component.removeTag('tag3');
      expect(component.tags()).toEqual(['tag1', 'tag2']);
    });
  });

  describe('onKeyDown', () => {
    it('should add tag on Enter key', () => {
      component.inputValue.set('newtag');
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      component.onKeyDown(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(component.tags()).toContain('newtag');
    });

    it('should remove last tag on Backspace when input is empty', () => {
      component.tags.set(['tag1', 'tag2']);
      component.inputValue.set('');
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      component.onKeyDown(event);
      expect(component.tags()).toEqual(['tag1']);
    });

    it('should not remove tag on Backspace when input has value', () => {
      component.tags.set(['tag1', 'tag2']);
      component.inputValue.set('test');
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      component.onKeyDown(event);
      expect(component.tags()).toEqual(['tag1', 'tag2']);
    });

    it('should not remove tag on Backspace when tags array is empty', () => {
      component.tags.set([]);
      component.inputValue.set('');
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      component.onKeyDown(event);
      expect(component.tags()).toEqual([]);
    });
  });

  describe('onInputChange', () => {
    it('should update inputValue', () => {
      component.onInputChange('new value');
      expect(component.inputValue()).toBe('new value');
    });
  });

  describe('showError', () => {
    it('should return false when control is not provided', () => {
      fixture.componentRef.setInput('control', undefined);
      fixture.detectChanges();
      expect(component.showError()).toBe(false);
    });

    it('should return false when control is valid', () => {
      const control = new FormControl(['tag1'], Validators.required);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      expect(component.showError()).toBe(false);
    });

    it('should return true when control is invalid and touched', () => {
      const control = new FormControl([], Validators.required);
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      expect(component.showError()).toBe(true);
    });
  });

  describe('activeErrorMessages', () => {
    it('should return error messages for invalid control', () => {
      const control = new FormControl([], Validators.required);
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
    });
  });
});
