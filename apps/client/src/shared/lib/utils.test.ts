import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('px-4', 'py-2');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    const falseCondition = false;
    const result = cn('px-4', condition && 'py-2', falseCondition && 'bg-red');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).not.toContain('bg-red');
  });

  it('should handle undefined and null', () => {
    expect(cn('px-4', undefined, null)).toBe('px-4');
  });

  it('should merge conflicting Tailwind classes (last wins)', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8');
  });

  it('should handle empty strings', () => {
    expect(cn('px-4', '')).toBe('px-4');
  });

  it('should handle arrays', () => {
    const result = cn(['px-4', 'py-2']);
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
  });

  it('should handle objects', () => {
    expect(cn({ 'px-4': true, 'py-2': false })).toBe('px-4');
  });

  it('should handle mixed inputs', () => {
    const falseCondition = false;
    const result = cn('px-4', ['py-2'], { 'bg-red': true }, falseCondition && 'text-white');
    expect(result).toContain('px-4');
    expect(result).toContain('py-2');
    expect(result).toContain('bg-red');
    expect(result).not.toContain('text-white');
  });
});
