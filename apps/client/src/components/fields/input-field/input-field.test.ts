import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideStore } from '@ngxs/store';
import { describe, expect, it, beforeEach } from 'vitest';

import { SpinnerState } from '$modules/spinner/store';
import { InputFieldComponent } from './input-field';

describe('InputFieldComponent', () => {
  let component: InputFieldComponent;
  let fixture: ComponentFixture<InputFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputFieldComponent, ReactiveFormsModule],
      providers: [provideStore([SpinnerState])],
    }).compileComponents();

    fixture = TestBed.createComponent(InputFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showError', () => {
    it('should return false when control is not provided', () => {
      fixture.componentRef.setInput('control', undefined);
      fixture.detectChanges();
      expect(component.showError()).toBe(false);
    });

    it('should return false when control is valid', () => {
      const control = new FormControl('valid value');
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      expect(component.showError()).toBe(false);
    });

    it('should return false when control is invalid but not touched or dirty', () => {
      const control = new FormControl('', Validators.required);
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      expect(component.showError()).toBe(false);
    });

    it('should return true when control is invalid and touched', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      expect(component.showError()).toBe(true);
    });

    it('should return true when control is invalid and dirty', () => {
      const control = new FormControl('', Validators.required);
      control.markAsDirty();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      expect(component.showError()).toBe(true);
    });
  });

  describe('activeErrorMessages', () => {
    it('should return empty array when control is not provided', () => {
      fixture.componentRef.setInput('control', undefined);
      fixture.detectChanges();
      expect(component.activeErrorMessages()).toEqual([]);
    });

    it('should return empty array when control has no errors', () => {
      const control = new FormControl('valid value');
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      expect(component.activeErrorMessages()).toEqual([]);
    });

    it('should return error messages for required validator', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toContain('必須');
    });

    it('should return error messages for email validator', () => {
      const control = new FormControl('invalid-email', Validators.email);
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should return custom error messages when provided', () => {
      const control = new FormControl('', Validators.required);
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('messages', { required: 'カスタムメッセージ' });
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages).toContain('カスタムメッセージ');
    });

    it('should handle minlength validator with actual value', () => {
      const control = new FormControl('ab', Validators.minLength(5));
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toContain('5文字以上');
    });

    it('should handle maxlength validator with actual value', () => {
      const control = new FormControl('123456', Validators.maxLength(5));
      control.markAsTouched();
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();
      const messages = component.activeErrorMessages();
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0]).toContain('5文字以内');
    });
  });

  describe('inputs', () => {
    it('should accept label input', () => {
      fixture.componentRef.setInput('label', 'Test Label');
      fixture.detectChanges();
      expect(component.label()).toBe('Test Label');
    });

    it('should accept id input', () => {
      fixture.componentRef.setInput('id', 'test-id');
      fixture.detectChanges();
      expect(component.id()).toBe('test-id');
    });

    it('should accept messages input', () => {
      const messages = { required: 'カスタムメッセージ' };
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();
      expect(component.messages()).toEqual(messages);
    });
  });
});
