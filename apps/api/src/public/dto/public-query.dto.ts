import { IsBoolean, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PublicProductQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString({ each: true }) categorySlug?: string | string[];
  @IsOptional() @IsString({ each: true }) brandSlug?: string | string[];
  @IsOptional() @Type(() => Boolean) @IsBoolean() featured?: boolean;
}
