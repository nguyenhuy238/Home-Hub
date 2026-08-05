import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadProductImageDto {
  @IsString() @MaxLength(160) altText!: string;
  @IsOptional() @IsString() isPrimary?: string;
}
