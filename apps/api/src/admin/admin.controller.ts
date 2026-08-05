import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import type { AuthenticatedRequest } from '../common/auth.types';
import { AdminService } from './admin.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { CreateAttributeDefinitionDto, UpdateAttributeDefinitionDto, UpdateProductAttributesDto } from './dto/attribute.dto';
import { ContactRequestListQueryDto, UpdateContactRequestStatusDto } from './dto/contact-request.dto';
import { CreateProductDto, ProductListQueryDto, UpdateProductDto } from './dto/product.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { UpdateStoreSettingsDto, UpdateStoreSlugDto } from './dto/store-settings.dto';
import { UploadProductImageDto } from './dto/media.dto';

@Controller('admin')
@UseGuards(AuthGuard, OwnerGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('context')
  async context(@Req() request: AuthenticatedRequest) {
    return { data: await this.adminService.context(request.tenantId!) };
  }

  @Get('store-settings')
  async storeSettings(@Req() request: AuthenticatedRequest) { return { data: await this.adminService.getStoreSettings(request.tenantId!) }; }

  @Patch('store-settings')
  async updateStoreSettings(@Body() input: UpdateStoreSettingsDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateStoreSettings(request.tenantId!, input, request.auth!.userId) }; }

  @Patch('store-settings/slug')
  async updateStoreSlug(@Body() input: UpdateStoreSlugDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateStoreSlug(request.tenantId!, input, request.auth!.userId) }; }

  @Get('categories')
  async categories(@Req() request: AuthenticatedRequest) { return { data: await this.adminService.listCategories(request.tenantId!) }; }

  @Post('categories')
  async createCategory(@Body() input: CreateCategoryDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.createCategory(request.tenantId!, input, request.auth!.userId) }; }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() input: UpdateCategoryDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateCategory(request.tenantId!, id, input, request.auth!.userId) }; }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.deleteCategory(request.tenantId!, id, request.auth!.userId) }; }

  @Get('brands')
  async brands(@Req() request: AuthenticatedRequest) { return { data: await this.adminService.listBrands(request.tenantId!) }; }

  @Post('brands')
  async createBrand(@Body() input: CreateBrandDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.createBrand(request.tenantId!, input, request.auth!.userId) }; }

  @Patch('brands/:id')
  async updateBrand(@Param('id') id: string, @Body() input: UpdateBrandDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateBrand(request.tenantId!, id, input, request.auth!.userId) }; }

  @Delete('brands/:id')
  async deleteBrand(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.hideBrand(request.tenantId!, id, request.auth!.userId) }; }

  @Get('attributes')
  async attributes(@Req() request: AuthenticatedRequest) { return { data: await this.adminService.listAttributeDefinitions(request.tenantId!) }; }

  @Post('attributes')
  async createAttribute(@Body() input: CreateAttributeDefinitionDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.createAttributeDefinition(request.tenantId!, input, request.auth!.userId) }; }

  @Patch('attributes/:id')
  async updateAttribute(@Param('id') id: string, @Body() input: UpdateAttributeDefinitionDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateAttributeDefinition(request.tenantId!, id, input, request.auth!.userId) }; }

  @Get('products')
  async products(@Query() query: ProductListQueryDto, @Req() request: AuthenticatedRequest) { return this.adminService.listProducts(request.tenantId!, query); }

  @Post('products')
  async createProduct(@Body() input: CreateProductDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.createProduct(request.tenantId!, input, request.auth!.userId) }; }

  @Get('products/:id')
  async product(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.getProduct(request.tenantId!, id) }; }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() input: UpdateProductDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateProduct(request.tenantId!, id, input, request.auth!.userId) }; }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.deleteProduct(request.tenantId!, id, request.auth!.userId) }; }

  @Post('products/:id/images')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 4 * 1024 * 1024 } }))
  async uploadProductImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File | undefined, @Body() input: UploadProductImageDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.uploadProductImage(request.tenantId!, id, file, input.altText, input.isPrimary === 'true', request.auth!.userId) }; }

  @Delete('products/:id/images/:imageId')
  async deleteProductImage(@Param('id') id: string, @Param('imageId') imageId: string, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.deleteProductImage(request.tenantId!, id, imageId, request.auth!.userId) }; }

  @Get('products/:id/attributes')
  async productAttributes(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.getProductAttributes(request.tenantId!, id) }; }

  @Put('products/:id/attributes')
  async updateProductAttributes(@Param('id') id: string, @Body() input: UpdateProductAttributesDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateProductAttributes(request.tenantId!, id, input, request.auth!.userId) }; }

  @Get('services')
  async services(@Req() request: AuthenticatedRequest) { return { data: await this.adminService.listServices(request.tenantId!) }; }

  @Post('services')
  async createService(@Body() input: CreateServiceDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.createService(request.tenantId!, input, request.auth!.userId) }; }

  @Patch('services/:id')
  async updateService(@Param('id') id: string, @Body() input: UpdateServiceDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateService(request.tenantId!, id, input, request.auth!.userId) }; }

  @Get('contact-requests')
  async contactRequests(@Query() query: ContactRequestListQueryDto, @Req() request: AuthenticatedRequest) { return this.adminService.listContactRequests(request.tenantId!, query); }

  @Get('contact-requests/:id')
  async contactRequest(@Param('id') id: string, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.getContactRequest(request.tenantId!, id) }; }

  @Patch('contact-requests/:id/status')
  async updateContactRequestStatus(@Param('id') id: string, @Body() input: UpdateContactRequestStatusDto, @Req() request: AuthenticatedRequest) { return { data: await this.adminService.updateContactRequestStatus(request.tenantId!, id, input, request.auth!.userId) }; }
}
