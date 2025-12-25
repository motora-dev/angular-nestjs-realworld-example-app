import { ERROR_CODE } from '@monorepo/error-code';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Tests to ensure server-side ERROR_CODE definitions stay in sync
 * with client-side translation files.
 */
describe('ERROR_CODE and translations sync', () => {
  const errorCodeValues = Object.values(ERROR_CODE);
  // Use process.cwd() which is the apps/client directory when running tests
  const i18nDir = resolve(process.cwd(), 'public/i18n/error');
  const langFiles = readdirSync(i18nDir).filter((f: string) => f.endsWith('.json'));

  describe.each(langFiles)('language: %s', (file: string) => {
    const translation = JSON.parse(readFileSync(resolve(i18nDir, file), 'utf-8')) as {
      errorCodes: Record<string, string>;
    };
    const translationKeys = Object.keys(translation.errorCodes);

    it('should have translations for all error codes', () => {
      const missingTranslations = errorCodeValues.filter((code) => !translationKeys.includes(code));

      if (missingTranslations.length > 0) {
        console.error('Missing translations for:', missingTranslations);
      }

      expect(missingTranslations).toEqual([]);
    });

    it('should not have unused translations (except UNEXPECTED_ERROR)', () => {
      // UNEXPECTED_ERROR is a fallback message used by the client, not a server error code
      const errorCodeSet = new Set<string>(errorCodeValues);
      const unusedTranslations = translationKeys.filter((key) => key !== 'UNEXPECTED_ERROR' && !errorCodeSet.has(key));

      if (unusedTranslations.length > 0) {
        console.warn('Unused translations:', unusedTranslations);
      }

      expect(unusedTranslations).toEqual([]);
    });
  });
});
