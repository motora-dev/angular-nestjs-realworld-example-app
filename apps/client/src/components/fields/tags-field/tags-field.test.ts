import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach, vi } from 'vitest';

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

  it('should initialize inputElement viewChild after template rendering', () => {
    // Initially, viewChild may not be available until template is rendered
    // After detectChanges, viewChild.required should be initialized (line 81: 'inputRef')
    fixture.detectChanges();

    // Verify that inputElement viewChild is accessible (line 81: 'inputRef')
    // viewChild.required('inputRef') is executed and the 'inputRef' string literal is evaluated
    const inputElement = component['inputElement']();
    expect(inputElement).toBeDefined();
    expect(inputElement.nativeElement).toBeDefined();
    expect(inputElement.nativeElement.tagName).toBe('INPUT');
  });

  it('should initialize viewChild.required with inputRef string literal', () => {
    // Create a new component instance to ensure viewChild.required('inputRef') is called
    // This ensures the 'inputRef' string literal in line 81 is evaluated
    const newFixture = TestBed.createComponent(TagsFieldComponent);
    const newComponent = newFixture.componentInstance;

    // Render template to trigger viewChild.required('inputRef') evaluation
    newFixture.detectChanges();

    // Access inputElement to ensure viewChild.required('inputRef') was called with 'inputRef'
    const inputElement = newComponent['inputElement']();
    expect(inputElement).toBeDefined();
    expect(inputElement.nativeElement).toBeDefined();
    expect(inputElement.nativeElement.tagName).toBe('INPUT');

    newFixture.destroy();
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

    it('should call setDisabledState', () => {
      // setDisabledState is currently a no-op, but we test that it can be called
      expect(() => {
        component.setDisabledState(true);
        component.setDisabledState(false);
      }).not.toThrow();
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

    it('should handle minlength validator with actual value', () => {
      // Create a control with minlength error manually to test the error message formatting
      const control = new FormControl<string[]>([]);
      // Manually set the error to test the error message handling
      control.setErrors({ minlength: { requiredLength: 5, actualLength: 2 } });
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toContain('5');
      expect(messages[0]).toContain('characters');
    });

    it('should handle maxlength validator with actual value', () => {
      // Create a control with maxlength error manually to test the error message formatting
      const control = new FormControl<string[]>([]);
      // Manually set the error to test the error message handling
      control.setErrors({ maxlength: { requiredLength: 5, actualLength: 6 } });
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toContain('5');
      expect(messages[0]).toContain('characters');
    });

    it('should return empty array when control errors is null', () => {
      const control = new FormControl<string[]>([]);
      // Set errors to null
      control.setErrors(null);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages).toEqual([]);
    });

    it('should return empty array when control errors is undefined', () => {
      const control = new FormControl<string[]>([]);
      // Set errors to undefined by clearing them
      control.setErrors({});
      control.setErrors(null);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages).toEqual([]);
    });

    it('should return fallback message when error key is not in messages', () => {
      const control = new FormControl<string[]>([]);
      // Set a custom error that doesn't exist in DEFAULT_ERROR_MESSAGES
      control.setErrors({ customError: true });
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toContain('customError');
      expect(messages[0]).toContain('error');
    });
  });

  describe('control value changes', () => {
    it('should update tags when control value changes to array', async () => {
      const control = new FormControl(['tag1', 'tag2']);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual(['tag1', 'tag2']);
    });

    it('should set empty array when control value is null', async () => {
      const control = new FormControl(null);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual([]);
    });

    it('should set empty array when control value is undefined', async () => {
      const control = new FormControl(undefined);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual([]);
    });

    it('should update tags when control valueChanges emits', async () => {
      const control = new FormControl(['initial']);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      control.setValue(['updated', 'tags']);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual(['updated', 'tags']);
    });

    it('should set empty array when valueChanges emits null', async () => {
      const control = new FormControl(['initial']);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      // Set value to null via valueChanges
      control.setValue(null);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual([]);
    });

    it('should set empty array when valueChanges emits undefined', async () => {
      const control = new FormControl(['initial']);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      // Set value to undefined via valueChanges (using type assertion for testing)
      control.setValue(undefined as any);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual([]);
    });

    it('should not update tags when valueChanges emits non-array, non-null, non-undefined value', async () => {
      const control = new FormControl(['initial', 'tags']);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual(['initial', 'tags']);

      // Set value to a non-array, non-null, non-undefined value (e.g., string)
      control.setValue('not-an-array' as any);
      fixture.detectChanges();
      await fixture.whenStable();

      // Tags should remain unchanged since the value doesn't match any condition
      expect(component.tags()).toEqual(['initial', 'tags']);
    });

    it('should handle initial value as array', async () => {
      const control = new FormControl(['initial', 'tags']);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual(['initial', 'tags']);
    });

    it('should handle initial value as null', async () => {
      const control = new FormControl(null);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual([]);
    });

    it('should handle initial value as undefined', async () => {
      const control = new FormControl(undefined);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.tags()).toEqual([]);
    });

    it('should not update tags when initial value is neither array nor null/undefined', async () => {
      // Set initial tags first
      component.tags.set(['existing', 'tags']);

      // Create control with a non-array, non-null, non-undefined value (e.g., string)
      const control = new FormControl('not-an-array' as any);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      await fixture.whenStable();

      // Tags should remain unchanged since the value doesn't match any condition
      expect(component.tags()).toEqual(['existing', 'tags']);
    });
  });

  describe('control state updates', () => {
    it('should update controlState when control status changes', async () => {
      const control = new FormControl<string[]>([], Validators.required);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();

      const initialState = component['controlState']();

      // Trigger status change
      control.setValue(['tag1']);

      // Wait for async updates
      await fixture.whenStable();
      fixture.detectChanges();

      // controlState should be updated (incremented)
      const newState = component['controlState']();
      expect(newState).toBeGreaterThan(initialState);
    });
  });

  describe('addTag input element', () => {
    it('should clear input element after adding tag', () => {
      // Ensure template is rendered so viewChild can find the element (line 81: viewChild.required)
      fixture.detectChanges();

      // This test verifies that the input element is cleared after addTag
      // The actual DOM manipulation happens in addTag method
      const inputElement = component['inputElement']();
      expect(inputElement).toBeDefined(); // Verify that viewChild.required on line 81 is working correctly
      inputElement.nativeElement.value = 'newtag';
      component.inputValue.set('newtag');
      component.addTag();
      expect(component.inputValue()).toBe('');
      // Verify that the native element value is also cleared (lines 213-216)
      expect(inputElement.nativeElement.value).toBe('');
    });

    it('should access inputElement viewChild when addTag is called', () => {
      // Ensure template is rendered so viewChild can find the element (line 81: viewChild.required)
      fixture.detectChanges();

      // Verify that inputElement viewChild is accessible (line 81)
      const inputElement = component['inputElement']();
      expect(inputElement).toBeDefined();
      expect(inputElement.nativeElement).toBeDefined();
      expect(inputElement.nativeElement.tagName).toBe('INPUT');

      // Set input value and call addTag to trigger inputElement() usage in addTag method (line 213)
      inputElement.nativeElement.value = 'test-tag';
      component.inputValue.set('test-tag');
      component.addTag();

      // Verify input element value is cleared (lines 213-216)
      expect(inputElement.nativeElement.value).toBe('');
      expect(component.inputValue()).toBe('');
    });

    it('should use inputElement viewChild in addTag method', () => {
      // Ensure template is rendered so viewChild can find the element (line 81)
      fixture.detectChanges();

      // Verify viewChild is initialized (line 81)
      expect(() => {
        const inputElement = component['inputElement']();
        expect(inputElement).toBeDefined();
      }).not.toThrow();

      // Call addTag which uses inputElement() internally (line 213)
      component.inputValue.set('tag-to-add');
      component.addTag();

      // Verify tag was added and input was cleared
      expect(component.tags()).toContain('tag-to-add');
      expect(component.inputValue()).toBe('');
    });
  });
});
