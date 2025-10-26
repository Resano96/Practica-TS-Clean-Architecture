import { describe, expect, it } from 'vitest';
import { SKU } from '@domain/value-objects/SKU';

describe('SKU value object', () => {
  it('normalizes value to uppercase and trims spaces', () => {
    const sku = SKU.create('  prod-123  ');
    expect(sku.value).toBe('PROD-123');
  });

  it('equals when value matches ignoring original casing', () => {
    const a = SKU.create('prod');
    const b = SKU.create('PROD');
    expect(a.equals(b)).toBe(true);
  });

  it('rejects invalid inputs', () => {
    expect(() => SKU.create('')).toThrow(
      'SKU must be a non-empty string containing letters, numbers, dashes or underscores',
    );
    expect(() => SKU.create('with space')).toThrow(
      'SKU must be a non-empty string containing letters, numbers, dashes or underscores',
    );
    expect(() => SKU.create('åäö')).toThrow(
      'SKU must be a non-empty string containing letters, numbers, dashes or underscores',
    );
  });
});
