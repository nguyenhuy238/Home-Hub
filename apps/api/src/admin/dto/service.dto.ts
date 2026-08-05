import { IsBoolean, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { PriceType, PublicationStatus } from '@prisma/client';

export class CreateServiceDto {
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() descriptionHtml?: string;
  @IsEnum(PriceType) priceType!: PriceType;
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsString() minPrice?: string;
  @IsOptional() @IsString() maxPrice?: string;
  @IsOptional() @IsString() coverImageKey?: string;
  @IsOptional() @IsEnum(PublicationStatus) publicationStatus?: PublicationStatus;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
}

export class UpdateServiceDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() descriptionHtml?: string;
  @IsOptional() @IsEnum(PriceType) priceType?: PriceType;
  @IsOptional() @IsString() price?: string;
  @IsOptional() @IsString() minPrice?: string;
  @IsOptional() @IsString() maxPrice?: string;
  @IsOptional() @IsString() coverImageKey?: string;
  @IsOptional() @IsEnum(PublicationStatus) publicationStatus?: PublicationStatus;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
}
