/**
 * Custom error class representing 404 errors that occur on the client side
 * Used when page navigation is required
 */
export class NotFoundError extends Error {
  readonly statusCode: number = 404;

  constructor(message: string = 'Page not found') {
    super(message);
    this.name = 'NotFoundError';
    // Set Error class prototype chain correctly
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
