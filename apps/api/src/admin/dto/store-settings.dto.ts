import { IsObject, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateStoreSettingsDto {
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsOptional() @IsString() @MaxLength(160) email?: string;
  @IsOptional() @IsString() logoKey?: string;
  @IsOptional() @IsString() bannerKey?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) zaloUrl?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) facebookUrl?: string;
  @IsOptional() @IsUrl({ require_protocol: true }) mapUrl?: string;
  @IsOptional() @IsObject() openingHours?: Record<string, unknown>;
  @IsOptional() @IsObject() themeSettings?: Record<string, unknown>;
  @IsOptional() @IsObject() seoDefaults?: Record<string, unknown>;
}

export class UpdateStoreSlugDto {
  @IsString() @MaxLength(80) slug!: string;
}
