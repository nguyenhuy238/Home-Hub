import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UploadProductImageDto {
  @IsString() @MaxLength(160) altText!: string;
  @IsOptional() @IsString() isPrimary?: string;
}

export class UpdateProductImageDto {
  @IsOptional() @IsString() @MaxLength(160) altText?: string;
  @IsOptional() @IsInt() @Min(0) @Max(1000) sortOrder?: number;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
}

export class ReorderProductImagesDto {
  @IsArray() @IsString({ each: true }) imageIds!: string[];
}
