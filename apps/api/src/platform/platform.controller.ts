import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PlatformAdminGuard } from '../auth/platform-admin.guard';
import type { AuthenticatedRequest } from '../common/auth.types';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreStatusDto } from './dto/update-store-status.dto';
import { PlatformService } from './platform.service';

@Controller('platform/stores')
@UseGuards(AuthGuard, PlatformAdminGuard)
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  async list() {
    return { data: await this.platformService.listStores() };
  }

  @Post()
  async create(@Body() input: CreateStoreDto, @Req() request: AuthenticatedRequest) {
    return { data: await this.platformService.createStore(input, request.auth!.userId) };
  }

  @Patch(':storeId/status')
  async updateStatus(@Param('storeId') storeId: string, @Body() input: UpdateStoreStatusDto, @Req() request: AuthenticatedRequest) {
    return { data: await this.platformService.updateStatus(storeId, input.status, input.suspensionNotice, request.auth!.userId) };
  }
}
