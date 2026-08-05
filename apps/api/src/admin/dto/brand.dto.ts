import { BrandStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateBrandDto {
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug?: string;
  @IsOptional() @IsString() logoKey?: string;
}

export class UpdateBrandDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug?: string;
  @IsOptional() @IsString() logoKey?: string;
  @IsOptional() @IsEnum(BrandStatus) status?: BrandStatus;
}
