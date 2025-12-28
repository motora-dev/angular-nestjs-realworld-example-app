import { FocusMonitor } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { InputDirective } from './input';

describe('InputDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let focusMonitor: FocusMonitor;

  @Component({
    template: `<input appInput [error]="hasError" [class]="customClass" />`,
    standalone: true,
    imports: [InputDirective],
  })
  class TestHostComponent {
    hasError = false;
    customClass = '';
  }

  beforeEach(() => {
    const mockFocusMonitor = {
      monitor: vi.fn(),
      stopMonitoring: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: FocusMonitor, useValue: mockFocusMonitor }],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    focusMonitor = TestBed.inject(FocusMonitor);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply default variant classes', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.className).toContain('rounded-md');
    expect(input.className).toContain('border');
  });

  it('should apply error variant classes when error is true', () => {
    component.hasError = true;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toContain('border-destructive');
  });

  it('should not apply error variant classes when error is false', () => {
    component.hasError = false;
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).not.toContain('border-destructive');
  });

  it('should apply custom classes', () => {
    component.customClass = 'custom-class';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toContain('custom-class');
  });

  it('should monitor focus on initialization', () => {
    fixture.detectChanges();
    expect(focusMonitor.monitor).toHaveBeenCalled();
  });

  it('should stop monitoring focus on destroy', () => {
    fixture.detectChanges();
    fixture.destroy();
    expect(focusMonitor.stopMonitoring).toHaveBeenCalled();
  });

  it('should apply custom class when class input is set', () => {
    component.customClass = 'my-custom-class';
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    expect(input.className).toContain('my-custom-class');
  });

  it('should work with textarea element', () => {
    @Component({
      template: `<textarea appInput [error]="hasError" [class]="customClass"></textarea>`,
      standalone: true,
      imports: [InputDirective],
    })
    class TextareaHostComponent {
      hasError = false;
      customClass = '';
    }

    const textareaFixture = TestBed.createComponent(TextareaHostComponent);
    textareaFixture.detectChanges();
    const textarea = textareaFixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea.className).toContain('rounded-md');
  });

  describe('default values', () => {
    it('should use default error value when not specified', () => {
      @Component({
        template: `<input appInput />`,
        standalone: true,
        imports: [InputDirective],
      })
      class DefaultInputComponent {}

      const defaultFixture = TestBed.createComponent(DefaultInputComponent);
      defaultFixture.detectChanges();
      const input = defaultFixture.nativeElement.querySelector('input');
      expect(input.className).not.toContain('border-destructive');
    });

    it('should handle empty class input', () => {
      component.customClass = '';
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.className).toContain('rounded-md');
    });
  });

  describe('computedClass', () => {
    it('should compute class with error and custom class', () => {
      component.hasError = true;
      component.customClass = 'my-class';
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.className).toContain('border-destructive');
      expect(input.className).toContain('my-class');
    });

    it('should compute class with default variant and custom class', () => {
      component.hasError = false;
      component.customClass = 'test-class';
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input');
      expect(input.className).not.toContain('border-destructive');
      expect(input.className).toContain('test-class');
    });

    it('should compute class with default error value and empty class', () => {
      @Component({
        template: `<input appInput />`,
        standalone: true,
        imports: [InputDirective],
      })
      class DefaultInputComponent {}

      const defaultFixture = TestBed.createComponent(DefaultInputComponent);
      defaultFixture.detectChanges();
      const input = defaultFixture.nativeElement.querySelector('input');
      expect(input.className).not.toContain('border-destructive');
      expect(input.className).toContain('rounded-md');
    });

    it('should compute class with error true and empty class', () => {
      @Component({
        template: `<input appInput [error]="true" />`,
        standalone: true,
        imports: [InputDirective],
      })
      class ErrorInputComponent {}

      const errorFixture = TestBed.createComponent(ErrorInputComponent);
      errorFixture.detectChanges();
      const input = errorFixture.nativeElement.querySelector('input');
      expect(input.className).toContain('border-destructive');
    });

    it('should compute class with error false and empty class', () => {
      @Component({
        template: `<input appInput [error]="false" />`,
        standalone: true,
        imports: [InputDirective],
      })
      class NoErrorInputComponent {}

      const noErrorFixture = TestBed.createComponent(NoErrorInputComponent);
      noErrorFixture.detectChanges();
      const input = noErrorFixture.nativeElement.querySelector('input');
      expect(input.className).not.toContain('border-destructive');
    });
  });

  describe('direct component access', () => {
    it('should access computedClass directly with default values', () => {
      @Component({
        template: `<input appInput #input />`,
        standalone: true,
        imports: [InputDirective],
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const inputElement = fixture.nativeElement.querySelector('input');
      const debugElement = fixture.debugElement.query(By.directive(InputDirective));
      const directive = debugElement?.injector.get(InputDirective);

      if (directive) {
        const computed = directive.computedClass();
        expect(computed).toBeDefined();
        expect(typeof computed).toBe('string');
      }

      expect(inputElement.className).not.toContain('border-destructive');
    });

    it('should access computedClass directly with error true', () => {
      @Component({
        template: `<input appInput [error]="true" class="test" #input />`,
        standalone: true,
        imports: [InputDirective],
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const inputElement = fixture.nativeElement.querySelector('input');
      const debugElement = fixture.debugElement.query(By.directive(InputDirective));
      const directive = debugElement?.injector.get(InputDirective);

      if (directive) {
        const computed = directive.computedClass();
        expect(computed).toBeDefined();
        expect(typeof computed).toBe('string');
        expect(computed).toContain('test');
        expect(computed).toContain('border-destructive');
      }

      expect(inputElement.className).toContain('border-destructive');
    });
  });
});
