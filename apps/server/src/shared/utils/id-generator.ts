import { createId } from '@paralleldrive/cuid2';

/**
 * Generate URL-safe public ID
 * Uses CUID2 (24 characters, high collision resistance, unpredictable)
 */
export const generatePublicId = (): string => {
  return createId();
};
