import { describe, expect, it } from 'vitest';
import { Quantity } from '@domain/value-objects/Quantity';

describe('Quantity value object', () => {
  it('creates a quantity with positive integers', () => {
    const quantity = Quantity.create(3);
    expect(quantity.value).toBe(3);
  });

  it('adds quantities returning a new instance', () => {
    const quantity = Quantity.create(2).add(Quantity.create(3));
    expect(quantity.value).toBe(5);
  });

  it('checks equality by value', () => {
    expect(Quantity.create(2).equals(Quantity.create(2))).toBe(true);
    expect(Quantity.create(2).equals(Quantity.create(3))).toBe(false);
  });

  it('throws when value is zero, negative or not integer', () => {
    expect(() => Quantity.create(0)).toThrow(
      'Quantity must be a positive integer greater than zero',
    );
    expect(() => Quantity.create(-1)).toThrow(
      'Quantity must be a positive integer greater than zero',
    );
    expect(() => Quantity.create(1.5)).toThrow(
      'Quantity must be a positive integer greater than zero',
    );
  });
});
