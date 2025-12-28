import { describe, expect, it } from 'vitest';

import { NotFoundError } from './client-errors';

describe('NotFoundError', () => {
  it('should create NotFoundError with default message', () => {
    const error = new NotFoundError();
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe('ページが見つかりませんでした');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('should create NotFoundError with custom message', () => {
    const customMessage = 'Custom not found message';
    const error = new NotFoundError(customMessage);
    expect(error.message).toBe(customMessage);
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
  });

  it('should have correct prototype chain', () => {
    const error = new NotFoundError();
    expect(Object.getPrototypeOf(error)).toBe(NotFoundError.prototype);
    expect(error instanceof NotFoundError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});
