import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength, MaxLength } from 'class-validator';
import { ContactSource } from '@prisma/client';

export class CreateContactRequestDto {
  @IsString() @MinLength(2) @MaxLength(120) customerName!: string;
  @IsString() @Matches(/^[0-9+\s().-]{8,30}$/) customerPhone!: string;
  @IsOptional() @IsEmail() @MaxLength(160) customerEmail?: string;
  @IsString() @MinLength(5) @MaxLength(4000) message!: string;
  @IsOptional() @IsString() productSlug?: string;
  @IsOptional() @IsEnum(ContactSource) source?: ContactSource;
}
