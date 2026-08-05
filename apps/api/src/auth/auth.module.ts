import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { OwnerGuard } from './owner.guard';
import { PlatformAdminGuard } from './platform-admin.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, OwnerGuard, PlatformAdminGuard],
  exports: [AuthService, AuthGuard, OwnerGuard, PlatformAdminGuard],
})
export class AuthModule {}
