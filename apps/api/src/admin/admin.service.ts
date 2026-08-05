import { BadRequestException, ConflictException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { del, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { AttributeDataType, BrandStatus, CategoryStatus, Prisma, PublicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizeRichText } from '../common/content';
import { toDecimal, validatePricing } from '../common/pricing';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import type { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import type { CreateAttributeDefinitionDto, ProductAttributeValueInputDto, UpdateAttributeDefinitionDto, UpdateProductAttributesDto } from './dto/attribute.dto';
import type { CreateProductDto, ProductListQueryDto, UpdateProductDto } from './dto/product.dto';
import type { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import type { ReorderProductImagesDto, UpdateProductImageDto } from './dto/media.dto';
import type { ContactRequestListQueryDto, UpdateContactRequestStatusDto } from './dto/contact-request.dto';
import type { UpdateStoreSettingsDto, UpdateStoreSlugDto } from './dto/store-settings.dto';

function slugify(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async context(storeId: string) {
    return this.prisma.store.findFirst({ where: { id: storeId, deletedAt: null }, include: { settings: true, membership: { include: { user: { select: { id: true, email: true, displayName: true } } } } } });
  }

  async getStoreSettings(storeId: string) {
    const store = await this.prisma.store.findFirst({ where: { id: storeId, deletedAt: null }, include: { settings: true } });
    if (!store) throw new NotFoundException('Không tìm thấy cửa hàng');
    return { store: { id: store.id, name: store.name, slug: store.slug, status: store.status, suspensionNotice: store.suspensionNotice }, settings: store.settings };
  }

  async updateStoreSettings(storeId: string, input: UpdateStoreSettingsDto, actorUserId: string) {
    const current = await this.getStoreSettings(storeId);
    const settingsData = { ...input, description: input.description === undefined ? undefined : sanitizeRichText(input.description), openingHours: input.openingHours as Prisma.InputJsonValue | undefined, themeSettings: input.themeSettings as Prisma.InputJsonValue | undefined, seoDefaults: input.seoDefaults as Prisma.InputJsonValue | undefined };
    const settings = await this.prisma.storeSettings.upsert({ where: { storeId }, create: { storeId, ...settingsData }, update: settingsData });
    await this.audit(storeId, actorUserId, 'UPDATE_STORE_SETTINGS', 'STORE_SETTINGS', storeId, current.settings ? { description: current.settings.description } : undefined, { description: settings.description });
    return settings;
  }

  async updateStoreSlug(storeId: string, input: UpdateStoreSlugDto, actorUserId: string) {
    const slug = input.slug.trim().toLowerCase();
    const current = await this.prisma.store.findFirst({ where: { id: storeId, deletedAt: null } });
    if (!current) throw new NotFoundException('Không tìm thấy cửa hàng');
    if (slug === current.slug) return current;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BadRequestException('Slug chỉ gồm chữ thường, số và dấu gạch ngang');
    const updated = await this.prisma.$transaction(async (tx) => {
      const [sameSlug, sameAlias] = await Promise.all([tx.store.findUnique({ where: { slug } }), tx.storeSlugAlias.findUnique({ where: { slug } })]);
      if (sameSlug || sameAlias) throw new ConflictException('Slug cửa hàng đã được sử dụng');
      await tx.storeSlugAlias.create({ data: { storeId, slug: current.slug } });
      return tx.store.update({ where: { id: storeId }, data: { slug } });
    });
    await this.audit(storeId, actorUserId, 'UPDATE_STORE_SLUG', 'STORE', storeId, { slug: current.slug }, { slug: updated.slug });
    return { id: updated.id, slug: updated.slug, previousSlug: current.slug };
  }

  async listCategories(storeId: string) {
    return this.prisma.category.findMany({ where: { storeId }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async createCategory(storeId: string, input: CreateCategoryDto, actorUserId: string) {
    const slug = input.slug ?? slugify(input.name);
    if (input.parentId) await this.assertCategory(storeId, input.parentId);
    try {
      const category = await this.prisma.category.create({ data: { storeId, name: input.name.trim(), slug, description: input.description, parentId: input.parentId, sortOrder: input.sortOrder ?? 0 } });
      await this.audit(storeId, actorUserId, 'CREATE_CATEGORY', 'CATEGORY', category.id);
      return category;
    } catch (error) { this.rethrowConflict(error, 'Slug danh mục đã được sử dụng'); }
  }

  async updateCategory(storeId: string, id: string, input: UpdateCategoryDto, actorUserId: string) {
    const current = await this.assertCategory(storeId, id);
    if (input.parentId === id) throw new BadRequestException('Danh mục không thể là parent của chính nó');
    if (input.parentId) await this.assertCategory(storeId, input.parentId);
    try {
      const category = await this.prisma.category.update({ where: { id }, data: { ...input } });
      await this.audit(storeId, actorUserId, 'UPDATE_CATEGORY', 'CATEGORY', id, { name: current.name }, { name: category.name });
      return category;
    } catch (error) { this.rethrowConflict(error, 'Slug danh mục đã được sử dụng'); }
  }

  async deleteCategory(storeId: string, id: string, actorUserId: string) {
    await this.assertCategory(storeId, id);
    const linked = await this.prisma.productCategory.count({ where: { storeId, categoryId: id } });
    if (linked > 0) throw new ConflictException('Không thể xóa danh mục đang có sản phẩm');
    const category = await this.prisma.category.update({ where: { id }, data: { status: CategoryStatus.HIDDEN } });
    await this.audit(storeId, actorUserId, 'HIDE_CATEGORY', 'CATEGORY', id);
    return category;
  }

  async listBrands(storeId: string) {
    return this.prisma.brand.findMany({ where: { storeId }, orderBy: [{ status: 'asc' }, { name: 'asc' }] });
  }

  async createBrand(storeId: string, input: CreateBrandDto, actorUserId: string) {
    const slug = input.slug ?? slugify(input.name);
    try {
      const brand = await this.prisma.brand.create({ data: { storeId, name: input.name.trim(), slug, logoKey: input.logoKey } });
      await this.audit(storeId, actorUserId, 'CREATE_BRAND', 'BRAND', brand.id);
      return brand;
    } catch (error) { this.rethrowConflict(error, 'Slug thương hiệu đã được sử dụng'); }
  }

  async updateBrand(storeId: string, id: string, input: UpdateBrandDto, actorUserId: string) {
    const current = await this.assertBrandRecord(storeId, id);
    try {
      const brand = await this.prisma.brand.update({ where: { id }, data: { name: input.name?.trim() ?? current.name, slug: input.slug ?? current.slug, logoKey: input.logoKey ?? current.logoKey, status: input.status ?? current.status } });
      await this.audit(storeId, actorUserId, 'UPDATE_BRAND', 'BRAND', id, { name: current.name, status: current.status }, { name: brand.name, status: brand.status });
      return brand;
    } catch (error) { this.rethrowConflict(error, 'Slug thương hiệu đã được sử dụng'); }
  }

  async hideBrand(storeId: string, id: string, actorUserId: string) {
    await this.assertBrandRecord(storeId, id);
    const brand = await this.prisma.brand.update({ where: { id }, data: { status: BrandStatus.HIDDEN } });
    await this.audit(storeId, actorUserId, 'HIDE_BRAND', 'BRAND', id);
    return brand;
  }

  async listAttributeDefinitions(storeId: string) {
    return this.prisma.productAttributeDefinition.findMany({ where: { storeId }, include: { category: { select: { id: true, name: true, slug: true } } }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async createAttributeDefinition(storeId: string, input: CreateAttributeDefinitionDto, actorUserId: string) {
    await this.assertOptionalCategory(storeId, input.categoryId);
    this.validateAttributeOptions(input.dataType, input.optionsJson as unknown as Prisma.InputJsonValue | undefined);
    try {
      const definition = await this.prisma.productAttributeDefinition.create({ data: { storeId, categoryId: input.categoryId, name: input.name.trim(), code: input.code.toLowerCase(), dataType: input.dataType, isFilterable: input.isFilterable ?? false, sortOrder: input.sortOrder ?? 0, optionsJson: input.optionsJson as unknown as Prisma.InputJsonValue | undefined }, include: { category: { select: { id: true, name: true, slug: true } } } });
      await this.audit(storeId, actorUserId, 'CREATE_ATTRIBUTE_DEFINITION', 'ATTRIBUTE_DEFINITION', definition.id);
      return definition;
    } catch (error) { this.rethrowConflict(error, 'Mã thuộc tính đã được sử dụng'); }
  }

  async updateAttributeDefinition(storeId: string, id: string, input: UpdateAttributeDefinitionDto, actorUserId: string) {
    const current = await this.assertAttributeDefinition(storeId, id);
    const dataType = input.dataType ?? current.dataType;
    const optionsJson = input.optionsJson ?? current.optionsJson;
    await this.assertOptionalCategory(storeId, input.categoryId ?? current.categoryId ?? undefined);
    this.validateAttributeOptions(dataType, optionsJson as unknown as Prisma.InputJsonValue | null | undefined);
    try {
      const definition = await this.prisma.productAttributeDefinition.update({ where: { id }, data: { categoryId: input.categoryId ?? current.categoryId, name: input.name?.trim() ?? current.name, code: input.code?.toLowerCase() ?? current.code, dataType, isFilterable: input.isFilterable ?? current.isFilterable, sortOrder: input.sortOrder ?? current.sortOrder, optionsJson: input.optionsJson === undefined ? undefined : input.optionsJson as unknown as Prisma.InputJsonValue }, include: { category: { select: { id: true, name: true, slug: true } } } });
      await this.audit(storeId, actorUserId, 'UPDATE_ATTRIBUTE_DEFINITION', 'ATTRIBUTE_DEFINITION', id);
      return definition;
    } catch (error) { this.rethrowConflict(error, 'Mã thuộc tính đã được sử dụng'); }
  }

  async listProducts(storeId: string, query: ProductListQueryDto, publicOnly = false) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 24, 100);
    const categorySlugs = query.categorySlug ? (Array.isArray(query.categorySlug) ? query.categorySlug : [query.categorySlug]) : [];
    const where: Prisma.ProductWhereInput = { storeId, deletedAt: null, ...(publicOnly ? { publicationStatus: PublicationStatus.PUBLISHED } : {}), ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}), ...(categorySlugs.length > 0 ? { categories: { some: { category: { slug: { in: categorySlugs }, status: CategoryStatus.ACTIVE } } } } : {}) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] }, categories: { include: { category: true } }, brand: true, attributeValues: { include: { definition: true } } }, orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async getProduct(storeId: string, id: string) {
    const product = await this.prisma.product.findFirst({ where: { id, storeId, deletedAt: null }, include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] }, categories: { include: { category: true } }, brand: true, attributeValues: { include: { definition: true } } } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  async createProduct(storeId: string, input: CreateProductDto, actorUserId: string) {
    const categoryIds = input.categoryIds ?? [];
    const publicationStatus = input.publicationStatus ?? PublicationStatus.DRAFT;
    this.assertPublishCategories(publicationStatus, categoryIds);
    validatePricing(input);
    await this.assertCategories(storeId, categoryIds);
    if (input.brandId) await this.assertBrand(storeId, input.brandId);
    const slug = input.slug ?? slugify(input.name);
    try {
      const product = await this.prisma.product.create({ data: { storeId, brandId: input.brandId, name: input.name.trim(), slug, sku: input.sku, shortDescription: input.shortDescription, descriptionHtml: sanitizeRichText(input.descriptionHtml), priceType: input.priceType, price: toDecimal(input.price), salePrice: toDecimal(input.salePrice), minPrice: toDecimal(input.minPrice), maxPrice: toDecimal(input.maxPrice), stockStatus: input.stockStatus, publicationStatus, isFeatured: input.isFeatured, publishedAt: publicationStatus === PublicationStatus.PUBLISHED ? new Date() : null, categories: { create: categoryIds.map((categoryId) => ({ storeId, categoryId })) } }, include: { categories: { include: { category: true } } } });
      await this.audit(storeId, actorUserId, 'CREATE_PRODUCT', 'PRODUCT', product.id);
      return product;
    } catch (error) { this.rethrowConflict(error, 'Slug hoặc SKU sản phẩm đã được sử dụng'); }
  }

  async updateProduct(storeId: string, id: string, input: UpdateProductDto, actorUserId: string) {
    const current = await this.getProduct(storeId, id);
    const categoryIds = input.categoryIds ?? current.categories.map((item) => item.categoryId);
    const publicationStatus = input.publicationStatus ?? current.publicationStatus;
    const nextPriceType = input.priceType ?? current.priceType;
    const nextPrice = input.price ?? current.price?.toString();
    const nextSalePrice = input.salePrice ?? current.salePrice?.toString();
    const nextMinPrice = input.minPrice ?? current.minPrice?.toString();
    const nextMaxPrice = input.maxPrice ?? current.maxPrice?.toString();
    this.assertPublishCategories(publicationStatus, categoryIds);
    validatePricing({ priceType: nextPriceType, price: nextPrice, salePrice: nextSalePrice, minPrice: nextMinPrice, maxPrice: nextMaxPrice });
    await this.assertCategories(storeId, categoryIds);
    const brandId = input.brandId === undefined ? current.brandId : input.brandId;
    if (brandId) await this.assertBrand(storeId, brandId);
    const product = await this.prisma.$transaction(async (tx) => {
      await tx.productCategory.deleteMany({ where: { productId: id, storeId } });
      return tx.product.update({ where: { id }, data: { brandId, name: input.name?.trim() ?? current.name, slug: input.slug ?? current.slug, sku: input.sku ?? current.sku, shortDescription: input.shortDescription ?? current.shortDescription, descriptionHtml: input.descriptionHtml === undefined ? undefined : sanitizeRichText(input.descriptionHtml), priceType: nextPriceType, price: toDecimal(nextPrice), salePrice: toDecimal(nextSalePrice), minPrice: toDecimal(nextMinPrice), maxPrice: toDecimal(nextMaxPrice), stockStatus: input.stockStatus ?? current.stockStatus, publicationStatus, isFeatured: input.isFeatured ?? current.isFeatured, publishedAt: publicationStatus === PublicationStatus.PUBLISHED ? (current.publishedAt ?? new Date()) : null, categories: { create: categoryIds.map((categoryId) => ({ storeId, categoryId })) } }, include: { categories: { include: { category: true } } } });
    });
    await this.audit(storeId, actorUserId, 'UPDATE_PRODUCT', 'PRODUCT', id);
    return product;
  }

  async deleteProduct(storeId: string, id: string, actorUserId: string) {
    await this.getProduct(storeId, id);
    const product = await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date(), publicationStatus: PublicationStatus.HIDDEN } });
    await this.audit(storeId, actorUserId, 'DELETE_PRODUCT', 'PRODUCT', id);
    return product;
  }

  async uploadProductImage(storeId: string, productId: string, file: Express.Multer.File | undefined, altText: string, isPrimary: boolean, actorUserId: string) {
    if (!file) throw new BadRequestException('Thiếu file hình ảnh');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) throw new BadRequestException('Chỉ hỗ trợ JPG, PNG hoặc WebP');
    if (file.size > 4 * 1024 * 1024) throw new BadRequestException('Hình ảnh không được vượt quá 4MB');
    const product = await this.getProduct(storeId, productId);
    if (!process.env.BLOB_READ_WRITE_TOKEN) throw new ServiceUnavailableException('Chưa cấu hình Vercel Blob');
    const extension = file.mimetype === 'image/jpeg' ? 'jpg' : file.mimetype.split('/')[1];
    const blob = await put(`stores/${storeId}/products/${productId}/${randomUUID()}.${extension}`, file.buffer, { access: 'public', addRandomSuffix: false, contentType: file.mimetype });
    const imageCount = await this.prisma.productImage.count({ where: { storeId, productId } });
    const shouldBePrimary = isPrimary || imageCount === 0;
    const image = await this.prisma.$transaction(async (tx) => {
      if (shouldBePrimary) await tx.productImage.updateMany({ where: { storeId, productId }, data: { isPrimary: false } });
      return tx.productImage.create({ data: { storeId, productId, storageKey: blob.pathname, publicUrl: blob.url, altText: altText.trim() || product.name, isPrimary: shouldBePrimary, sortOrder: imageCount } });
    });
    await this.audit(storeId, actorUserId, 'CREATE_PRODUCT_IMAGE', 'PRODUCT_IMAGE', image.id, undefined, { productId, pathname: blob.pathname });
    return image;
  }

  async listProductImages(storeId: string, productId: string) {
    await this.getProduct(storeId, productId);
    return this.prisma.productImage.findMany({ where: { storeId, productId }, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { id: 'asc' }] });
  }

  async updateProductImage(storeId: string, productId: string, imageId: string, input: UpdateProductImageDto, actorUserId: string) {
    await this.getProduct(storeId, productId);
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, storeId, productId } });
    if (!image) throw new NotFoundException('Không tìm thấy hình ảnh');
    const updated = await this.prisma.$transaction(async (tx) => {
      if (input.isPrimary === true) await tx.productImage.updateMany({ where: { storeId, productId }, data: { isPrimary: false } });
      return tx.productImage.update({ where: { id: imageId }, data: { altText: input.altText?.trim() || undefined, sortOrder: input.sortOrder, isPrimary: input.isPrimary === true ? true : undefined } });
    });
    await this.audit(storeId, actorUserId, 'UPDATE_PRODUCT_IMAGE', 'PRODUCT_IMAGE', imageId, { altText: image.altText, sortOrder: image.sortOrder, isPrimary: image.isPrimary }, { altText: updated.altText, sortOrder: updated.sortOrder, isPrimary: updated.isPrimary });
    return updated;
  }

  async reorderProductImages(storeId: string, productId: string, input: ReorderProductImagesDto, actorUserId: string) {
    await this.getProduct(storeId, productId);
    const imageIds = [...new Set(input.imageIds)];
    const images = await this.prisma.productImage.findMany({ where: { storeId, productId }, select: { id: true } });
    if (imageIds.length !== images.length || images.some((image) => !imageIds.includes(image.id))) throw new BadRequestException('Danh sách sắp xếp hình ảnh không hợp lệ');
    await this.prisma.$transaction(imageIds.map((imageId, sortOrder) => this.prisma.productImage.update({ where: { id: imageId }, data: { sortOrder } })));
    await this.audit(storeId, actorUserId, 'REORDER_PRODUCT_IMAGES', 'PRODUCT', productId);
    return this.listProductImages(storeId, productId);
  }

  async deleteProductImage(storeId: string, productId: string, imageId: string, actorUserId: string) {
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, storeId, productId } });
    if (!image) throw new NotFoundException('Không tìm thấy hình ảnh');
    if (process.env.BLOB_READ_WRITE_TOKEN) await del(image.storageKey);
    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.delete({ where: { id: imageId } });
      if (image.isPrimary) {
        const fallback = await tx.productImage.findFirst({ where: { storeId, productId }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
        if (fallback) await tx.productImage.update({ where: { id: fallback.id }, data: { isPrimary: true } });
      }
    });
    await this.audit(storeId, actorUserId, 'DELETE_PRODUCT_IMAGE', 'PRODUCT_IMAGE', imageId);
    return { id: imageId };
  }

  async getProductAttributes(storeId: string, productId: string) {
    await this.getProduct(storeId, productId);
    return this.prisma.productAttributeValue.findMany({ where: { storeId, productId }, include: { definition: { include: { category: { select: { id: true, name: true, slug: true } } } } }, orderBy: { definition: { sortOrder: 'asc' } } });
  }

  async updateProductAttributes(storeId: string, productId: string, input: UpdateProductAttributesDto, actorUserId: string) {
    await this.getProduct(storeId, productId);
    const values = input.values ?? [];
    const definitionIds = [...new Set(values.map((value) => value.attributeDefinitionId))];
    const definitions = await this.prisma.productAttributeDefinition.findMany({ where: { storeId, id: { in: definitionIds } } });
    if (definitions.length !== definitionIds.length) throw new BadRequestException('Một hoặc nhiều thuộc tính không thuộc cửa hàng hiện tại');
    const definitionMap = new Map(definitions.map((definition) => [definition.id, definition]));
    const normalized = values.map((value) => this.normalizeAttributeValue(value, definitionMap.get(value.attributeDefinitionId)!));
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.productAttributeValue.deleteMany({ where: { storeId, productId } });
      if (normalized.length > 0) await tx.productAttributeValue.createMany({ data: normalized.map((value) => ({ storeId, productId, ...value })) });
      return tx.productAttributeValue.findMany({ where: { storeId, productId }, include: { definition: true }, orderBy: { definition: { sortOrder: 'asc' } } });
    });
    await this.audit(storeId, actorUserId, 'UPDATE_PRODUCT_ATTRIBUTES', 'PRODUCT', productId);
    return updated;
  }

  async listServices(storeId: string) {
    return this.prisma.service.findMany({ where: { storeId, deletedAt: null }, orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }] });
  }

  async listContactRequests(storeId: string, query: ContactRequestListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 20, 100);
    const where = { storeId, ...(query.status ? { status: query.status } : {}) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.contactRequest.findMany({ where, include: { product: { select: { id: true, name: true, slug: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      this.prisma.contactRequest.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async getContactRequest(storeId: string, id: string) {
    const request = await this.prisma.contactRequest.findFirst({ where: { id, storeId }, include: { product: { select: { id: true, name: true, slug: true } } } });
    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu liên hệ');
    return request;
  }

  async updateContactRequestStatus(storeId: string, id: string, input: UpdateContactRequestStatusDto, actorUserId: string) {
    const current = await this.getContactRequest(storeId, id);
    const updated = await this.prisma.contactRequest.update({ where: { id }, data: { status: input.status } });
    await this.audit(storeId, actorUserId, 'UPDATE_CONTACT_STATUS', 'CONTACT_REQUEST', id, { status: current.status }, { status: updated.status });
    return updated;
  }

  async createService(storeId: string, input: CreateServiceDto, actorUserId: string) {
    const publicationStatus = input.publicationStatus ?? PublicationStatus.DRAFT;
    validatePricing(input);
    const service = await this.prisma.service.create({ data: { storeId, name: input.name.trim(), slug: input.slug ?? slugify(input.name), shortDescription: input.shortDescription, descriptionHtml: sanitizeRichText(input.descriptionHtml), priceType: input.priceType, price: toDecimal(input.price), minPrice: toDecimal(input.minPrice), maxPrice: toDecimal(input.maxPrice), coverImageKey: input.coverImageKey, publicationStatus, isFeatured: input.isFeatured, publishedAt: publicationStatus === PublicationStatus.PUBLISHED ? new Date() : null } });
    await this.audit(storeId, actorUserId, 'CREATE_SERVICE', 'SERVICE', service.id);
    return service;
  }

  async updateService(storeId: string, id: string, input: UpdateServiceDto, actorUserId: string) {
    const current = await this.prisma.service.findFirst({ where: { id, storeId, deletedAt: null } });
    if (!current) throw new NotFoundException('Không tìm thấy dịch vụ');
    const nextPriceType = input.priceType ?? current.priceType;
    const nextPrice = input.price ?? current.price?.toString();
    const nextMinPrice = input.minPrice ?? current.minPrice?.toString();
    const nextMaxPrice = input.maxPrice ?? current.maxPrice?.toString();
    const publicationStatus = input.publicationStatus ?? current.publicationStatus;
    validatePricing({ priceType: nextPriceType, price: nextPrice, minPrice: nextMinPrice, maxPrice: nextMaxPrice });
    const service = await this.prisma.service.update({ where: { id }, data: { name: input.name?.trim() ?? current.name, slug: input.slug ?? current.slug, shortDescription: input.shortDescription ?? current.shortDescription, descriptionHtml: input.descriptionHtml === undefined ? undefined : sanitizeRichText(input.descriptionHtml), priceType: nextPriceType, price: toDecimal(nextPrice), minPrice: toDecimal(nextMinPrice), maxPrice: toDecimal(nextMaxPrice), coverImageKey: input.coverImageKey ?? current.coverImageKey, publicationStatus, isFeatured: input.isFeatured ?? current.isFeatured, publishedAt: publicationStatus === PublicationStatus.PUBLISHED ? (current.publishedAt ?? new Date()) : null } });
    await this.audit(storeId, actorUserId, 'UPDATE_SERVICE', 'SERVICE', id);
    return service;
  }

  private async assertCategory(storeId: string, id: string) {
    const category = await this.prisma.category.findFirst({ where: { id, storeId, status: CategoryStatus.ACTIVE } });
    if (!category) throw new BadRequestException('Danh mục không thuộc cửa hàng hiện tại');
    return category;
  }

  private async assertCategories(storeId: string, ids: string[]) {
    const uniqueIds = [...new Set(ids)];
    const count = await this.prisma.category.count({ where: { id: { in: uniqueIds }, storeId, status: CategoryStatus.ACTIVE } });
    if (count !== uniqueIds.length) throw new BadRequestException('Một hoặc nhiều danh mục không thuộc cửa hàng hiện tại');
  }

  private async assertBrand(storeId: string, id: string) {
    const brand = await this.prisma.brand.findFirst({ where: { id, storeId } });
    if (!brand) throw new BadRequestException('Thương hiệu không thuộc cửa hàng hiện tại');
  }

  private async assertBrandRecord(storeId: string, id: string) {
    const brand = await this.prisma.brand.findFirst({ where: { id, storeId } });
    if (!brand) throw new NotFoundException('Không tìm thấy thương hiệu');
    return brand;
  }

  private async assertOptionalCategory(storeId: string, categoryId?: string) {
    if (!categoryId) return;
    await this.assertCategory(storeId, categoryId);
  }

  private async assertAttributeDefinition(storeId: string, id: string) {
    const definition = await this.prisma.productAttributeDefinition.findFirst({ where: { id, storeId } });
    if (!definition) throw new NotFoundException('Không tìm thấy thuộc tính');
    return definition;
  }

  private validateAttributeOptions(dataType: AttributeDataType, optionsJson: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined) {
    if (dataType !== AttributeDataType.SELECT) return;
    const values = optionsJson && typeof optionsJson === 'object' && !Array.isArray(optionsJson) && 'values' in optionsJson ? optionsJson.values : undefined;
    if (!Array.isArray(values) || values.length === 0 || values.some((value) => typeof value !== 'string' || value.trim() === '')) throw new BadRequestException('Thuộc tính SELECT cần optionsJson.values là danh sách chuỗi');
  }

  private normalizeAttributeValue(input: ProductAttributeValueInputDto, definition: { id: string; dataType: AttributeDataType; optionsJson: Prisma.JsonValue | null }) {
    if (definition.dataType === AttributeDataType.TEXT) {
      if (!input.valueText?.trim()) throw new BadRequestException(`Thuộc tính ${definition.id} cần valueText`);
      return { attributeDefinitionId: definition.id, valueText: input.valueText.trim(), valueNumber: null, valueBoolean: null, valueJson: Prisma.JsonNull };
    }
    if (definition.dataType === AttributeDataType.SELECT) {
      this.validateAttributeOptions(definition.dataType, definition.optionsJson);
      const options = definition.optionsJson && typeof definition.optionsJson === 'object' && !Array.isArray(definition.optionsJson) && 'values' in definition.optionsJson && Array.isArray(definition.optionsJson.values) ? definition.optionsJson.values : [];
      if (!input.valueText || !options.includes(input.valueText)) throw new BadRequestException(`Giá trị không hợp lệ cho thuộc tính ${definition.id}`);
      return { attributeDefinitionId: definition.id, valueText: input.valueText, valueNumber: null, valueBoolean: null, valueJson: Prisma.JsonNull };
    }
    if (definition.dataType === AttributeDataType.NUMBER) {
      const valueNumber = toDecimal(input.valueNumber);
      if (!valueNumber) throw new BadRequestException(`Thuộc tính ${definition.id} cần valueNumber`);
      return { attributeDefinitionId: definition.id, valueText: null, valueNumber, valueBoolean: null, valueJson: Prisma.JsonNull };
    }
    if (typeof input.valueBoolean !== 'boolean') throw new BadRequestException(`Thuộc tính ${definition.id} cần valueBoolean`);
    return { attributeDefinitionId: definition.id, valueText: null, valueNumber: null, valueBoolean: input.valueBoolean, valueJson: Prisma.JsonNull };
  }

  private assertPublishCategories(status: PublicationStatus, categoryIds: string[]) {
    if (status === PublicationStatus.PUBLISHED && categoryIds.length === 0) throw new BadRequestException('Sản phẩm đã xuất bản phải có ít nhất một danh mục');
  }

  private async audit(storeId: string, actorUserId: string, action: string, entityType: string, entityId: string, beforeJson?: Prisma.InputJsonValue, afterJson?: Prisma.InputJsonValue) {
    await this.prisma.auditLog.create({ data: { storeId, actorUserId, action, entityType, entityId, beforeJson, afterJson } });
  }

  private rethrowConflict(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException(message);
    throw error;
  }
}
