/**
 * Tests to ensure all i18n keys extracted from templates have corresponding
 * translations in the JSON files.
 *
 * This test runs after `ng extract-i18n` generates the messages.xlf file,
 * verifying that all translation keys exist in each language's JSON files.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface TranslationData {
  [key: string]: string | TranslationData;
}

/**
 * Get nested value from object using dot-separated key path
 */
function getNestedValue(obj: TranslationData, keys: string[]): string | undefined {
  let current: TranslationData | string | undefined = obj;

  for (const key of keys) {
    if (current === undefined || current === null || typeof current === 'string') {
      return undefined;
    }
    current = current[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Load JSON translation file
 */
function loadJsonTranslations(filePath: string): TranslationData {
  if (!existsSync(filePath)) {
    return {};
  }
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

/**
 * Extract all trans-unit IDs from XLF file
 */
function extractIdsFromXlf(xlfPath: string): string[] {
  if (!existsSync(xlfPath)) {
    return [];
  }

  const content = readFileSync(xlfPath, 'utf-8');
  const idRegex = /<trans-unit\s+id="([^"]+)"/g;
  const ids: string[] = [];

  let match;
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }

  return ids;
}

/**
 * Get translation for a given ID from UI and error translations
 */
function getTranslation(
  id: string,
  uiTranslations: TranslationData,
  errorTranslations: TranslationData,
): string | undefined {
  const keys = id.split('.');

  // First try UI translations
  const uiValue = getNestedValue(uiTranslations, keys);
  if (uiValue) return uiValue;

  // Then try error translations
  const errorValue = getNestedValue(errorTranslations, keys);
  if (errorValue) return errorValue;

  return undefined;
}

describe('Translation sync', () => {
  const xlfPath = resolve(process.cwd(), 'locale/messages.xlf');
  const uiI18nDir = resolve(process.cwd(), 'public/i18n/ui');
  const errorI18nDir = resolve(process.cwd(), 'public/i18n/error');

  // Skip tests if XLF file doesn't exist (e.g., before first build)
  const xlfExists = existsSync(xlfPath);
  const describeOrSkip = xlfExists ? describe : describe.skip;

  describeOrSkip('i18n keys from templates', () => {
    const xlfIds = extractIdsFromXlf(xlfPath);

    // Get all language files from ui directory
    const uiFiles = existsSync(uiI18nDir) ? readdirSync(uiI18nDir).filter((f) => f.endsWith('.json')) : [];
    const languages = uiFiles.map((f) => f.replace('.json', ''));

    it.each(languages)('should have all i18n keys defined in %s.json', (lang) => {
      const uiTranslations = loadJsonTranslations(resolve(uiI18nDir, `${lang}.json`));
      const errorTranslations = loadJsonTranslations(resolve(errorI18nDir, `${lang}.json`));

      const missingKeys = xlfIds.filter((id) => !getTranslation(id, uiTranslations, errorTranslations));

      if (missingKeys.length > 0) {
        console.error(`\nMissing translations for ${lang}:`);
        missingKeys.forEach((key) => console.error(`  - ${key}`));
      }

      expect(missingKeys, `Missing ${missingKeys.length} translations for ${lang}`).toEqual([]);
    });

    it('should not have duplicate IDs in XLF', () => {
      const idCounts = new Map<string, number>();
      xlfIds.forEach((id) => {
        idCounts.set(id, (idCounts.get(id) || 0) + 1);
      });

      const duplicates = Array.from(idCounts.entries())
        .filter(([, count]) => count > 1)
        .map(([id]) => id);

      if (duplicates.length > 0) {
        console.error('\nDuplicate i18n IDs found:');
        duplicates.forEach((id) => console.error(`  - ${id}`));
      }

      expect(duplicates).toEqual([]);
    });
  });

  describeOrSkip('JSON files have consistent keys', () => {
    // Get all language files
    const uiFiles = existsSync(uiI18nDir) ? readdirSync(uiI18nDir).filter((f) => f.endsWith('.json')) : [];
    const languages = uiFiles.map((f) => f.replace('.json', ''));

    if (languages.length < 2) {
      it.skip('needs at least 2 languages to compare', () => {});
      return;
    }

    const baseLanguage = 'en';
    const otherLanguages = languages.filter((l) => l !== baseLanguage);

    /**
     * Flatten nested object keys
     */
    function flattenKeys(obj: TranslationData, prefix = ''): string[] {
      const keys: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (typeof value === 'string') {
          keys.push(fullKey);
        } else {
          keys.push(...flattenKeys(value, fullKey));
        }
      }
      return keys;
    }

    it.each(otherLanguages)('should have same keys in ui/%s.json as ui/en.json', (lang) => {
      const enTranslations = loadJsonTranslations(resolve(uiI18nDir, 'en.json'));
      const langTranslations = loadJsonTranslations(resolve(uiI18nDir, `${lang}.json`));

      const enKeys = new Set(flattenKeys(enTranslations));
      const langKeys = new Set(flattenKeys(langTranslations));

      const missingInLang = Array.from(enKeys).filter((k) => !langKeys.has(k));
      const extraInLang = Array.from(langKeys).filter((k) => !enKeys.has(k));

      if (missingInLang.length > 0) {
        console.error(`\nKeys in en.json but missing in ${lang}.json:`);
        missingInLang.slice(0, 10).forEach((key) => console.error(`  - ${key}`));
        if (missingInLang.length > 10) {
          console.error(`  ... and ${missingInLang.length - 10} more`);
        }
      }

      if (extraInLang.length > 0) {
        console.warn(`\nExtra keys in ${lang}.json not in en.json:`);
        extraInLang.slice(0, 10).forEach((key) => console.warn(`  - ${key}`));
        if (extraInLang.length > 10) {
          console.warn(`  ... and ${extraInLang.length - 10} more`);
        }
      }

      expect(missingInLang, `Missing ${missingInLang.length} keys in ${lang}.json`).toEqual([]);
    });
  });
});
