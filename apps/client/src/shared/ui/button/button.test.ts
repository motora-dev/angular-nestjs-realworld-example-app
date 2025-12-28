import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';

import { ButtonDirective } from './button';

describe('ButtonDirective', () => {
  it('should render default button with correct styles', async () => {
    await render(`<button appButton>Click me</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeDefined();
    expect(button.className).toContain('bg-primary');
  });

  it('should render destructive variant', async () => {
    await render(`<button appButton variant="destructive">Delete</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeDefined();
    expect(button.className).toContain('bg-destructive');
  });

  it('should render outline variant', async () => {
    await render(`<button appButton variant="outline">Cancel</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Cancel' });
    expect(button).toBeDefined();
    expect(button.className).toContain('border');
  });

  it('should render small size', async () => {
    await render(`<button appButton size="sm">Small</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Small' });
    expect(button).toBeDefined();
    expect(button.className).toContain('h-8');
  });

  it('should render large size', async () => {
    await render(`<button appButton size="lg">Large</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Large' });
    expect(button).toBeDefined();
    expect(button.className).toContain('h-10');
  });

  it('should be disabled when disabled attribute is set', async () => {
    await render(`<button appButton disabled>Disabled</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDefined();
    expect(button).toHaveProperty('disabled', true);
  });

  it('should render secondary variant', async () => {
    await render(`<button appButton variant="secondary">Secondary</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toBeDefined();
    expect(button.className).toContain('bg-secondary');
  });

  it('should render ghost variant', async () => {
    await render(`<button appButton variant="ghost">Ghost</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toBeDefined();
    expect(button.className).toContain('hover:bg-accent');
  });

  it('should render link variant', async () => {
    await render(`<button appButton variant="link">Link</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Link' });
    expect(button).toBeDefined();
    expect(button.className).toContain('text-primary');
  });

  it('should render icon size', async () => {
    await render(`<button appButton size="icon">Icon</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Icon' });
    expect(button).toBeDefined();
    expect(button.className).toContain('h-9');
    expect(button.className).toContain('w-9');
  });

  it('should render default size', async () => {
    await render(`<button appButton size="default">Default Size</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Default Size' });
    expect(button).toBeDefined();
    expect(button.className).toContain('h-9');
  });

  it('should apply custom class', async () => {
    await render(`<button appButton class="custom-class">Custom</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toBeDefined();
    expect(button.className).toContain('custom-class');
  });

  it('should combine variant and size', async () => {
    await render(`<button appButton variant="destructive" size="sm">Delete</button>`, {
      imports: [ButtonDirective],
    });

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toBeDefined();
    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('h-8');
  });

  it('should work with anchor tag', async () => {
    await render(`<a appButton href="/test">Link Button</a>`, {
      imports: [ButtonDirective],
    });

    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeDefined();
    expect(link.className).toContain('bg-primary');
  });

  describe('default values', () => {
    it('should use default variant when not specified', async () => {
      await render(`<button appButton>Default</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Default' });
      expect(button.className).toContain('bg-primary');
    });

    it('should use default size when not specified', async () => {
      await render(`<button appButton>Default Size</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Default Size' });
      expect(button.className).toContain('h-9');
    });

    it('should handle empty class input', async () => {
      await render(`<button appButton class="">Empty Class</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Empty Class' });
      expect(button).toBeDefined();
      expect(button.className).toContain('bg-primary');
    });
  });

  describe('computedClass', () => {
    it('should compute class with all variants and sizes', async () => {
      await render(`<button appButton variant="secondary" size="lg" class="custom">Computed</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Computed' });
      expect(button.className).toContain('bg-secondary');
      expect(button.className).toContain('h-10');
      expect(button.className).toContain('custom');
    });

    it('should compute class with default variant and default size', async () => {
      await render(`<button appButton>Default All</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Default All' });
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('h-9');
    });

    it('should compute class with variant and default size', async () => {
      await render(`<button appButton variant="outline">Outline Default</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Outline Default' });
      expect(button.className).toContain('border');
      expect(button.className).toContain('h-9');
    });

    it('should compute class with default variant and size', async () => {
      await render(`<button appButton variant="default" size="default">Explicit Defaults</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Explicit Defaults' });
      expect(button.className).toContain('bg-primary');
      expect(button.className).toContain('h-9');
    });

    it('should compute class with empty class input', async () => {
      await render(`<button appButton class="">Empty Class</button>`, {
        imports: [ButtonDirective],
      });

      const button = screen.getByRole('button', { name: 'Empty Class' });
      expect(button.className).toContain('bg-primary');
    });
  });

  describe('direct component access', () => {
    it('should access computedClass directly with default values', () => {
      @Component({
        template: `<button appButton #btn>Test</button>`,
        standalone: true,
        imports: [ButtonDirective],
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const buttonElement = fixture.nativeElement.querySelector('button');
      const debugElement = fixture.debugElement.query(By.directive(ButtonDirective));
      const directive = debugElement?.injector.get(ButtonDirective);

      if (directive) {
        const computed = directive.computedClass();
        expect(computed).toBeDefined();
        expect(typeof computed).toBe('string');
      }

      expect(buttonElement.className).toContain('bg-primary');
    });

    it('should access computedClass directly with custom values', () => {
      @Component({
        template: `<button appButton variant="ghost" size="sm" class="test" #btn>Test</button>`,
        standalone: true,
        imports: [ButtonDirective],
      })
      class TestComponent {}

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      const buttonElement = fixture.nativeElement.querySelector('button');
      const debugElement = fixture.debugElement.query(By.directive(ButtonDirective));
      const directive = debugElement?.injector.get(ButtonDirective);

      if (directive) {
        const computed = directive.computedClass();
        expect(computed).toBeDefined();
        expect(typeof computed).toBe('string');
        expect(computed).toContain('test');
      }

      expect(buttonElement.className).toContain('hover:bg-accent');
      expect(buttonElement.className).toContain('h-8');
    });
  });
});
