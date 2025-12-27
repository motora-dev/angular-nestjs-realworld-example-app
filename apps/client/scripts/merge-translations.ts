/**
 * Merge Translations Script
 *
 * This script reads the extracted messages.xlf file and merges translations
 * from JSON files (ui/*.json and error/*.json) to generate locale-specific XLF files.
 *
 * Usage: tsx scripts/merge-translations.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Configuration
const LOCALES = ['ja'] as const;
const SOURCE_XLF_PATH = resolve(process.cwd(), 'locale/messages.xlf');
const UI_I18N_DIR = resolve(process.cwd(), 'public/i18n/ui');
const ERROR_I18N_DIR = resolve(process.cwd(), 'public/i18n/error');
const OUTPUT_DIR = resolve(process.cwd(), 'locale');

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
    console.warn(`Warning: Translation file not found: ${filePath}`);
    return {};
  }
  return JSON.parse(readFileSync(filePath, 'utf-8'));
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

/**
 * Parse XLF file and extract trans-units
 */
function parseXlf(xlfContent: string): {
  header: string;
  transUnits: Array<{ id: string; content: string }>;
  footer: string;
} {
  // Extract header (everything before first trans-unit)
  const headerMatch = xlfContent.match(/^([\s\S]*?)<trans-unit/);
  const header = headerMatch ? headerMatch[1] : '';

  // Extract footer (everything after last </trans-unit>)
  const footerMatch = xlfContent.match(/<\/trans-unit>\s*(<\/body>[\s\S]*)$/);
  const footer = footerMatch ? footerMatch[1] : '</body>\n  </file>\n</xliff>\n';

  // Extract all trans-units
  const transUnitRegex = /<trans-unit\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/trans-unit>/g;
  const transUnits: Array<{ id: string; content: string }> = [];

  let match;
  while ((match = transUnitRegex.exec(xlfContent)) !== null) {
    transUnits.push({
      id: match[1],
      content: match[0],
    });
  }

  return { header, transUnits, footer };
}

/**
 * Add target element to trans-unit
 */
function addTargetToTransUnit(transUnit: string, translation: string, targetLang: string): string {
  // Escape XML special characters in translation
  const escapedTranslation = translation
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Insert target after source
  const sourceEndIndex = transUnit.indexOf('</source>');
  if (sourceEndIndex === -1) {
    return transUnit;
  }

  const insertPosition = sourceEndIndex + '</source>'.length;
  const before = transUnit.slice(0, insertPosition);
  const after = transUnit.slice(insertPosition);

  return `${before}\n        <target>${escapedTranslation}</target>${after}`;
}

/**
 * Generate locale-specific XLF file
 */
function generateLocaleXlf(
  sourceXlfContent: string,
  locale: string,
  uiTranslations: TranslationData,
  errorTranslations: TranslationData,
): { xlf: string; missingKeys: string[] } {
  const { header, transUnits, footer } = parseXlf(sourceXlfContent);
  const missingKeys: string[] = [];

  // Add target-language attribute to file element
  const headerWithTargetLang = header.replace(
    /<file\s+source-language="en"/,
    `<file source-language="en" target-language="${locale}"`,
  );

  // Process each trans-unit
  const processedTransUnits = transUnits.map(({ id, content }) => {
    const translation = getTranslation(id, uiTranslations, errorTranslations);

    if (translation) {
      return addTargetToTransUnit(content, translation, locale);
    } else {
      missingKeys.push(id);
      return content;
    }
  });

  const xlf = headerWithTargetLang + processedTransUnits.join('\n      ') + footer;
  return { xlf, missingKeys };
}

/**
 * Main function
 */
function main(): void {
  console.log('🌍 Starting translation merge...\n');

  // Check if source XLF exists
  if (!existsSync(SOURCE_XLF_PATH)) {
    console.error(`Error: Source XLF file not found: ${SOURCE_XLF_PATH}`);
    console.error('Please run "ng extract-i18n" first.');
    process.exit(1);
  }

  // Read source XLF
  const sourceXlfContent = readFileSync(SOURCE_XLF_PATH, 'utf-8');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let totalMissingKeys = 0;

  for (const locale of LOCALES) {
    console.log(`Processing locale: ${locale}`);

    // Load translations
    const uiTranslations = loadJsonTranslations(resolve(UI_I18N_DIR, `${locale}.json`));
    const errorTranslations = loadJsonTranslations(resolve(ERROR_I18N_DIR, `${locale}.json`));

    // Generate locale-specific XLF
    const { xlf, missingKeys } = generateLocaleXlf(sourceXlfContent, locale, uiTranslations, errorTranslations);

    // Write output file
    const outputPath = resolve(OUTPUT_DIR, `messages.${locale}.xlf`);
    writeFileSync(outputPath, xlf, 'utf-8');

    console.log(`  ✅ Generated: ${outputPath}`);

    if (missingKeys.length > 0) {
      console.log(`  ⚠️  Missing ${missingKeys.length} translations:`);
      missingKeys.slice(0, 10).forEach((key) => console.log(`      - ${key}`));
      if (missingKeys.length > 10) {
        console.log(`      ... and ${missingKeys.length - 10} more`);
      }
      totalMissingKeys += missingKeys.length;
    }

    console.log('');
  }

  if (totalMissingKeys > 0) {
    console.log(`⚠️  Total missing translations: ${totalMissingKeys}`);
    console.log('   Add missing translations to the JSON files and run this script again.');
  } else {
    console.log('✅ All translations merged successfully!');
  }
}

main();
