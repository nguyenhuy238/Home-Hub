import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @MinLength(8)
  ownerPassword!: string;

  @IsString()
  @MinLength(2)
  ownerDisplayName!: string;

  @IsOptional()
  @IsString()
  ownerPhone?: string;
}
