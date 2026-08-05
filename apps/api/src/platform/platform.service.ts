import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StoreStatus } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService, private readonly authService: AuthService) {}

  async listStores() {
    return this.prisma.store.findMany({
      where: { deletedAt: null },
      include: { membership: { include: { user: { select: { id: true, email: true, displayName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStore(input: CreateStoreDto, actorUserId: string) {
    const email = input.ownerEmail.trim().toLowerCase();
    const result = await this.prisma.$transaction(async (tx) => {
      const existingStore = await tx.store.findUnique({ where: { slug: input.slug } });
      const existingAlias = await tx.storeSlugAlias.findUnique({ where: { slug: input.slug } });
      if (existingStore || existingAlias) throw new ConflictException('Slug cửa hàng đã được sử dụng');

      const existingOwner = await tx.user.findUnique({ where: { email }, include: { membership: true } });
      if (existingOwner?.membership) throw new ConflictException('User này đã thuộc một cửa hàng');
      const owner = existingOwner ?? await tx.user.create({ data: { email, displayName: input.ownerDisplayName, passwordHash: await this.authService.createPasswordHash(input.ownerPassword) } });

      const store = await tx.store.create({ data: { name: input.name, slug: input.slug, ownerContactEmail: email } });
      await tx.storeMember.create({ data: { storeId: store.id, userId: owner.id } });
      await tx.storeSettings.create({ data: { storeId: store.id, phone: input.ownerPhone } });
      await tx.auditLog.create({ data: { actorUserId, storeId: store.id, action: 'CREATE_STORE', entityType: 'STORE', entityId: store.id, afterJson: { name: input.name, slug: input.slug } } });
      return { store, owner };
    });

    return { id: result.store.id, name: result.store.name, slug: result.store.slug, owner: { id: result.owner.id, email: result.owner.email } };
  }

  async updateStatus(storeId: string, status: StoreStatus, suspensionNotice: string | undefined, actorUserId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });
    if (!store) throw new NotFoundException('Không tìm thấy cửa hàng');
    const updated = await this.prisma.store.update({ where: { id: store.id }, data: { status, suspensionNotice: suspensionNotice ?? store.suspensionNotice } });
    await this.prisma.auditLog.create({ data: { actorUserId, storeId, action: 'UPDATE_STORE_STATUS', entityType: 'STORE', entityId: storeId, beforeJson: { status: store.status }, afterJson: { status } } });
    return { id: updated.id, status: updated.status, suspensionNotice: updated.suspensionNotice };
  }
}
