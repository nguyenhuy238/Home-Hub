import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { StoreStatus } from '@prisma/client';

export class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status!: StoreStatus;
  @IsOptional() @IsString() @MaxLength(1000) suspensionNotice?: string;
}
