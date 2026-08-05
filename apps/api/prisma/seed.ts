import { PrismaClient, PriceType, PublicationStatus, StoreMemberRole, StoreStatus, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await hash('HomeHub123!', 12);
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'admin@homehub.local' },
    update: {},
    create: { email: 'admin@homehub.local', displayName: 'HomeHub Admin', passwordHash, isPlatformAdmin: true },
  });

  for (const definition of [
    { email: 'owner-a@homehub.local', displayName: 'Owner Nội thất An Nhiên', storeName: 'Nội thất An Nhiên', slug: 'noi-that-an-nhien' },
    { email: 'owner-b@homehub.local', displayName: 'Owner Gạch Minh Châu', storeName: 'Gạch Minh Châu', slug: 'gach-minh-chau' },
  ]) {
    const owner = await prisma.user.upsert({
      where: { email: definition.email },
      update: { displayName: definition.displayName, status: UserStatus.ACTIVE },
      create: { email: definition.email, displayName: definition.displayName, passwordHash },
    });
    const store = await prisma.store.upsert({
      where: { slug: definition.slug },
      update: { name: definition.storeName, status: StoreStatus.ACTIVE },
      create: { name: definition.storeName, slug: definition.slug, ownerContactEmail: definition.email },
    });
    await prisma.storeMember.upsert({
      where: { userId: owner.id },
      update: { storeId: store.id, role: StoreMemberRole.OWNER },
      create: { storeId: store.id, userId: owner.id, role: StoreMemberRole.OWNER },
    });
    const category = await prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: 'san-pham-noi-bat' } },
      update: {},
      create: { storeId: store.id, name: 'Sản phẩm nổi bật', slug: 'san-pham-noi-bat' },
    });
    await prisma.storeSettings.upsert({ where: { storeId: store.id }, update: {}, create: { storeId: store.id, phone: '0900000000' } });
    const existingProduct = await prisma.product.findFirst({ where: { storeId: store.id, slug: 'san-pham-demo' } });
    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          storeId: store.id,
          name: definition.slug === 'gach-minh-chau' ? 'Gạch vân đá demo' : 'Bàn ăn gỗ sồi demo',
          slug: 'san-pham-demo',
          shortDescription: 'Sản phẩm demo để kiểm tra storefront.',
          descriptionHtml: '<p>Sản phẩm demo của HomeHub. Hãy thay bằng nội dung thật trong admin.</p>',
          priceType: PriceType.CONTACT,
          publicationStatus: PublicationStatus.PUBLISHED,
          publishedAt: new Date(),
          categories: { create: { storeId: store.id, categoryId: category.id } },
        },
      });
      await prisma.auditLog.create({ data: { actorUserId: platformAdmin.id, storeId: store.id, action: 'SEED_PRODUCT', entityType: 'PRODUCT', entityId: product.id } });
    }
  }
}

main().finally(() => prisma.$disconnect());
