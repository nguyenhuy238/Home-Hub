import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryStatus, ContactSource, PriceType, Prisma, PublicationStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LeadNotificationService } from '../leads/lead-notification.service';
import { CreateContactRequestDto } from './dto/contact-request.dto';
import { PublicProductQueryDto } from './dto/public-query.dto';

type ResolvedStore = {
  id: string;
  name: string;
  slug: string;
  status: StoreStatus;
  suspensionNotice: string | null;
  settings: {
    description: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    zaloUrl: string | null;
    facebookUrl: string | null;
    mapUrl: string | null;
    logoKey: string | null;
    bannerKey: string | null;
  } | null;
  aliasMatched: boolean;
};

function assetUrl(key: string | null): string | null {
  if (!key) return null;
  return key.startsWith('http://') || key.startsWith('https://') ? key : null;
}

function decimalNumber(value: Prisma.Decimal | null): number | null {
  return value === null ? null : Number(value);
}

function values(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

@Injectable()
export class PublicService {
  private readonly contactRateLimits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly prisma: PrismaService, private readonly notifications: LeadNotificationService) {}

  async getStore(storeSlug: string) {
    const store = await this.resolveStore(storeSlug);
    if (store.status === StoreStatus.ARCHIVED) throw new NotFoundException('Không tìm thấy cửa hàng');
    return { data: this.toPublicStore(store), meta: { canonicalSlug: store.slug, aliasMatched: store.aliasMatched } };
  }

  async listCategories(storeSlug: string) {
    const store = await this.requireCatalogStore(storeSlug);
    const data = await this.prisma.category.findMany({ where: { storeId: store.id, status: CategoryStatus.ACTIVE }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], select: { id: true, name: true, slug: true, description: true, imageKey: true, parentId: true } });
    return { data: data.map((category) => ({ ...category, imageUrl: assetUrl(category.imageKey) })) };
  }

  async listProducts(storeSlug: string, query: PublicProductQueryDto) {
    const store = await this.requireCatalogStore(storeSlug);
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 24, 100);
    const categorySlugs = values(query.categorySlug);
    const brandSlugs = values(query.brandSlug);
    const where: Prisma.ProductWhereInput = {
      storeId: store.id,
      deletedAt: null,
      publicationStatus: PublicationStatus.PUBLISHED,
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
      ...(query.featured === true ? { isFeatured: true } : {}),
      ...(categorySlugs.length ? { categories: { some: { category: { slug: { in: categorySlugs }, status: CategoryStatus.ACTIVE } } } } : {}),
      ...(brandSlugs.length ? { brand: { slug: { in: brandSlugs }, status: 'ACTIVE' } } : {}),
    };
    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] } }, orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { name: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.product.count({ where }),
    ]);
    return { data: products.map((product) => this.toProductSummary(product)), meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async getProduct(storeSlug: string, productSlug: string) {
    const store = await this.requireCatalogStore(storeSlug);
    const product = await this.prisma.product.findFirst({ where: { storeId: store.id, slug: productSlug, deletedAt: null, publicationStatus: PublicationStatus.PUBLISHED }, include: { brand: true, images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] }, categories: { include: { category: { select: { id: true, name: true, slug: true } } } }, attributeValues: { include: { definition: true } } } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return { data: { ...this.toProductSummary(product), sku: product.sku, shortDescription: product.shortDescription, descriptionHtml: product.descriptionHtml, stockStatus: product.stockStatus, brand: product.brand ? { name: product.brand.name, slug: product.brand.slug } : null, categories: product.categories.map(({ category }) => category), images: product.images.map((image) => ({ id: image.id, url: image.publicUrl ?? assetUrl(image.storageKey), altText: image.altText, isPrimary: image.isPrimary, sortOrder: image.sortOrder })), attributes: product.attributeValues.map((value) => ({ name: value.definition.name, code: value.definition.code, dataType: value.definition.dataType, text: value.valueText, number: value.valueNumber === null ? null : Number(value.valueNumber), boolean: value.valueBoolean, json: value.valueJson })) } };
  }

  async listServices(storeSlug: string) {
    const store = await this.requireCatalogStore(storeSlug);
    const services = await this.prisma.service.findMany({ where: { storeId: store.id, deletedAt: null, publicationStatus: PublicationStatus.PUBLISHED }, orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { name: 'asc' }] });
    return { data: services.map((service) => ({ id: service.id, name: service.name, slug: service.slug, shortDescription: service.shortDescription, descriptionHtml: service.descriptionHtml, priceType: service.priceType, price: decimalNumber(service.price), minPrice: decimalNumber(service.minPrice), maxPrice: decimalNumber(service.maxPrice), currency: 'VND' as const, coverImageUrl: assetUrl(service.coverImageKey), publicationStatus: 'PUBLISHED' as const })) };
  }

  async createContactRequest(storeSlug: string, input: CreateContactRequestDto, clientIp: string) {
    const store = await this.requireCatalogStore(storeSlug);
    this.assertContactRateLimit(`${store.id}:${clientIp}`);
    let productId: string | undefined;
    if (input.productSlug) {
      const product = await this.prisma.product.findFirst({ where: { storeId: store.id, slug: input.productSlug, deletedAt: null, publicationStatus: PublicationStatus.PUBLISHED }, select: { id: true } });
      if (!product) throw new BadRequestException('Sản phẩm liên hệ không hợp lệ');
      productId = product.id;
    }
    const contactRequest = await this.prisma.contactRequest.create({ data: { storeId: store.id, productId, customerName: input.customerName.trim(), customerPhone: input.customerPhone.trim(), customerEmail: input.customerEmail?.trim().toLowerCase(), message: input.message.trim(), source: input.source ?? ContactSource.WEBSITE } });
    await this.notifications.notify(contactRequest.id);
    return { data: { id: contactRequest.id, status: contactRequest.status, createdAt: contactRequest.createdAt } };
  }

  private assertContactRateLimit(key: string) {
    const now = Date.now();
    const current = this.contactRateLimits.get(key);
    if (!current || current.resetAt <= now) {
      this.contactRateLimits.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
      return;
    }
    if (current.count >= 5) throw new HttpException('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.', HttpStatus.TOO_MANY_REQUESTS);
    current.count += 1;
  }

  private async resolveStore(storeSlug: string): Promise<ResolvedStore> {
    const direct = await this.prisma.store.findFirst({ where: { slug: storeSlug, deletedAt: null }, include: { settings: { select: { description: true, address: true, phone: true, email: true, zaloUrl: true, facebookUrl: true, mapUrl: true, logoKey: true, bannerKey: true } } } });
    if (direct) return { ...direct, aliasMatched: false };
    const alias = await this.prisma.storeSlugAlias.findUnique({ where: { slug: storeSlug }, include: { store: { include: { settings: { select: { description: true, address: true, phone: true, email: true, zaloUrl: true, facebookUrl: true, mapUrl: true, logoKey: true, bannerKey: true } } } } } });
    if (alias?.store.deletedAt === null) return { ...alias.store, aliasMatched: true };
    throw new NotFoundException('Không tìm thấy cửa hàng');
  }

  private async requireCatalogStore(storeSlug: string) {
    const store = await this.resolveStore(storeSlug);
    if (store.status === StoreStatus.ARCHIVED) throw new NotFoundException('Không tìm thấy cửa hàng');
    if (store.status === StoreStatus.SUSPENDED) throw new NotFoundException('Cửa hàng đang tạm ngưng hiển thị catalog');
    return store;
  }

  private toPublicStore(store: ResolvedStore) {
    return { name: store.name, slug: store.slug, status: store.status === StoreStatus.SUSPENDED ? 'SUSPENDED' as const : 'ACTIVE' as const, suspensionNotice: store.status === StoreStatus.SUSPENDED ? store.suspensionNotice : null, description: store.settings?.description ?? null, address: store.settings?.address ?? null, phone: store.settings?.phone ?? null, email: store.settings?.email ?? null, zaloUrl: store.settings?.zaloUrl ?? null, facebookUrl: store.settings?.facebookUrl ?? null, mapUrl: store.settings?.mapUrl ?? null, logoUrl: assetUrl(store.settings?.logoKey ?? null), bannerUrl: assetUrl(store.settings?.bannerKey ?? null) };
  }

  private toProductSummary(product: { id: string; name: string; slug: string; priceType: PriceType; price: Prisma.Decimal | null; images: Array<{ publicUrl: string | null; storageKey: string }> }) {
    const image = product.images[0];
    return { id: product.id, name: product.name, slug: product.slug, priceType: product.priceType, price: decimalNumber(product.price), currency: 'VND' as const, thumbnailUrl: image?.publicUrl ?? assetUrl(image?.storageKey ?? null), publicationStatus: 'PUBLISHED' as const };
  }
}
