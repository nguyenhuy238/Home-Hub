import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { toDecimal, validatePricing } from './pricing';

test('validatePricing accepts contact pricing without a numeric price', () => {
  assert.doesNotThrow(() => validatePricing({ priceType: 'CONTACT' }));
});

test('validatePricing rejects an invalid range', () => {
  assert.throws(() => validatePricing({ priceType: 'RANGE', minPrice: '500000', maxPrice: '100000' }), BadRequestException);
});

test('toDecimal rejects negative values', () => {
  assert.throws(() => toDecimal('-1'), BadRequestException);
});
