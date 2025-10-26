import { describe, expect, it } from 'vitest';
import { Money } from '@domain/value-objects/Money';

describe('Money value object', () => {
  it('rounds amounts to two decimals and normalizes currency', () => {
    const money = Money.create(10.129, 'usd');

    expect(money.amount).toBe(10.13);
    expect(money.currency.code).toBe('USD');
  });

  it('adds two money instances with same currency', () => {
    const price = Money.create(10, 'USD');
    const tax = Money.create(2.345, 'USD');

    const total = price.add(tax);

    expect(total.amount).toBe(12.35);
    expect(total.currency.code).toBe('USD');
  });

  it('throws when trying to add different currencies', () => {
    const usd = Money.create(10, 'USD');
    const eur = Money.create(5, 'EUR');

    expect(() => usd.add(eur)).toThrow('Cannot combine money in different currencies');
  });

  it('multiplies preserving rounding rules', () => {
    const price = Money.create(12.34, 'USD');

    const total = price.multiply(2.5);

    expect(total.amount).toBe(30.85);
  });

  it('compares equality by amount and currency', () => {
    const first = Money.create(5, 'USD');
    const second = Money.create(5, 'USD');
    const third = Money.create(5, 'EUR');

    expect(first.equals(second)).toBe(true);
    expect(first.equals(third)).toBe(false);
  });

  it('throws when creating with non-finite amount', () => {
    expect(() => Money.create(Number.NaN, 'USD')).toThrow(
      'Money amount must be a finite number',
    );
  });

  it('rejects multiplication with invalid multiplier', () => {
    const price = Money.create(5, 'USD');
    expect(() => price.multiply(Number.NaN)).toThrow(
      'Multiplier must be a finite number',
    );
  });
});
