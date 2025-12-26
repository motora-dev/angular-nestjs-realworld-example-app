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
});
