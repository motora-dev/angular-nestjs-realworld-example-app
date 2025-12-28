import { generatePublicId } from './id-generator';

describe('generatePublicId', () => {
  it('should generate a string', () => {
    const id = generatePublicId();

    expect(typeof id).toBe('string');
  });

  it('should generate non-empty string', () => {
    const id = generatePublicId();

    expect(id.length).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const id1 = generatePublicId();
    const id2 = generatePublicId();
    const id3 = generatePublicId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should generate IDs with consistent length', () => {
    const ids = Array.from({ length: 10 }, () => generatePublicId());

    const lengths = ids.map((id) => id.length);
    const uniqueLengths = new Set(lengths);

    // CUID2 generates 24-character IDs
    expect(uniqueLengths.size).toBe(1);
    expect(lengths[0]).toBe(24);
  });

  it('should generate URL-safe IDs', () => {
    const id = generatePublicId();

    // URL-safe characters: alphanumeric, -, _
    // CUID2 uses base36 encoding which is URL-safe
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it('should generate multiple IDs without collisions', () => {
    const ids = new Set();
    const count = 100;

    for (let i = 0; i < count; i++) {
      ids.add(generatePublicId());
    }

    // All IDs should be unique
    expect(ids.size).toBe(count);
  });
});
