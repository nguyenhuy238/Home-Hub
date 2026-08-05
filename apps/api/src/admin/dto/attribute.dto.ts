import { AttributeDataType } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class CreateAttributeDefinitionDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @Matches(/^[a-z0-9_]+$/) code!: string;
  @IsEnum(AttributeDataType) dataType!: AttributeDataType;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsBoolean() isFilterable?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsObject() optionsJson?: Record<string, unknown>;
}

export class UpdateAttributeDefinitionDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9_]+$/) code?: string;
  @IsOptional() @IsEnum(AttributeDataType) dataType?: AttributeDataType;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsBoolean() isFilterable?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsObject() optionsJson?: Record<string, unknown>;
}

export class ProductAttributeValueInputDto {
  @IsString() attributeDefinitionId!: string;
  @IsOptional() @IsString() valueText?: string;
  @IsOptional() @IsString() valueNumber?: string;
  @IsOptional() @IsBoolean() valueBoolean?: boolean;
  @IsOptional() valueJson?: unknown;
}

export class UpdateProductAttributesDto {
  @IsArray() values!: ProductAttributeValueInputDto[];
}
