import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    const mockDomSanitizer = {
      sanitize: vi.fn((_context: SecurityContext, value: string) => value),
    };

    TestBed.configureTestingModule({
      providers: [MarkdownPipe, { provide: DomSanitizer, useValue: mockDomSanitizer }],
    });

    pipe = TestBed.inject(MarkdownPipe);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  describe('transform', () => {
    it('should transform markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is a **test**.';
      const result = await pipe.transform(markdown);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(domSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, expect.any(String));
    });

    it('should sanitize HTML output', async () => {
      const markdown = '# Test';
      await pipe.transform(markdown);

      expect(domSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, expect.any(String));
    });

    it('should handle empty string', async () => {
      const result = await pipe.transform('');

      expect(result).toBeDefined();
      expect(domSanitizer.sanitize).toHaveBeenCalledWith(SecurityContext.HTML, expect.any(String));
    });

    it('should handle complex markdown', async () => {
      const markdown = `
# Title

## Subtitle

- List item 1
- List item 2

**Bold** and *italic* text.

\`\`\`javascript
const code = 'example';
\`\`\`
      `;
      const result = await pipe.transform(markdown);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return empty string when sanitize returns null', async () => {
      vi.mocked(domSanitizer.sanitize).mockReturnValueOnce(null);
      const result = await pipe.transform('# Test');

      expect(result).toBe('');
    });
  });
});
