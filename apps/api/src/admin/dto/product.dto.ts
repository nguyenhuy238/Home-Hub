import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';
import { PriceType, PublicationStatus, StockStatus } from '@prisma/client';

class ProductFieldsDto {
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() descriptionHtml?: string;
  @IsEnum(PriceType) priceType!: PriceType;
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsString() salePrice?: string;
  @IsOptional() @IsString() minPrice?: string;
  @IsOptional() @IsString() maxPrice?: string;
  @IsOptional() @IsEnum(StockStatus) stockStatus?: StockStatus;
  @IsOptional() @IsEnum(PublicationStatus) publicationStatus?: PublicationStatus;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsString() brandId?: string;
}

export class CreateProductDto extends ProductFieldsDto {
  @IsArray() @IsString({ each: true }) categoryIds!: string[];
}

export class UpdateProductDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() descriptionHtml?: string;
  @IsOptional() @IsEnum(PriceType) priceType?: PriceType;
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsString() salePrice?: string;
  @IsOptional() @IsString() minPrice?: string;
  @IsOptional() @IsString() maxPrice?: string;
  @IsOptional() @IsEnum(StockStatus) stockStatus?: StockStatus;
  @IsOptional() @IsEnum(PublicationStatus) publicationStatus?: PublicationStatus;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @IsString() brandId?: string;
}

export class ProductListQueryDto {
  @IsOptional() @IsInt() @Min(1) page?: number;
  @IsOptional() @IsInt() @Min(1) @Min(1) pageSize?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString({ each: true }) categorySlug?: string | string[];
}
