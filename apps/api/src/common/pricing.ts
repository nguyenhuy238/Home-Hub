import { BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import type { PriceType } from '@prisma/client';

export interface PriceInput {
  priceType: PriceType;
  price?: string | null;
  salePrice?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
}

export function validatePricing(input: PriceInput): void {
  const price = toDecimal(input.price);
  const salePrice = toDecimal(input.salePrice);
  const minPrice = toDecimal(input.minPrice);
  const maxPrice = toDecimal(input.maxPrice);
  if (input.priceType === 'FIXED' && !price) throw new BadRequestException('FIXED cần có price');
  if (input.priceType === 'FROM' && !minPrice && !price) throw new BadRequestException('FROM cần có minPrice hoặc price');
  if (input.priceType === 'RANGE' && (!minPrice || !maxPrice)) throw new BadRequestException('RANGE cần có minPrice và maxPrice');
  if (minPrice && maxPrice && minPrice.greaterThan(maxPrice)) throw new BadRequestException('minPrice không được lớn hơn maxPrice');
  if (salePrice && price && salePrice.greaterThan(price)) throw new BadRequestException('salePrice không được lớn hơn price');
}

export function toDecimal(value: string | null | undefined): Decimal | null {
  if (value === undefined || value === null || value === '') return null;
  try {
    const decimal = new Decimal(value);
    if (!decimal.isFinite() || decimal.isNegative()) throw new Error('invalid');
    return decimal;
  } catch {
    throw new BadRequestException('Giá phải là số không âm hợp lệ');
  }
}
