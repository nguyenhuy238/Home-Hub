import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ContactRequestStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class ContactRequestListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) pageSize?: number;
  @IsOptional() @IsEnum(ContactRequestStatus) status?: ContactRequestStatus;
}

export class UpdateContactRequestStatusDto {
  @IsEnum(ContactRequestStatus) status!: ContactRequestStatus;
}
