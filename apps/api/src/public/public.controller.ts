import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreateContactRequestDto } from './dto/contact-request.dto';
import { PublicProductQueryDto } from './dto/public-query.dto';
import { PublicService } from './public.service';

@Controller('public/stores/:storeSlug')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get()
  store(@Param('storeSlug') storeSlug: string) { return this.publicService.getStore(storeSlug); }

  @Get('categories')
  categories(@Param('storeSlug') storeSlug: string) { return this.publicService.listCategories(storeSlug); }

  @Get('products')
  products(@Param('storeSlug') storeSlug: string, @Query() query: PublicProductQueryDto) { return this.publicService.listProducts(storeSlug, query); }

  @Get('products/:productSlug')
  product(@Param('storeSlug') storeSlug: string, @Param('productSlug') productSlug: string) { return this.publicService.getProduct(storeSlug, productSlug); }

  @Get('services')
  services(@Param('storeSlug') storeSlug: string) { return this.publicService.listServices(storeSlug); }

  @Post('contact-requests')
  contactRequest(@Param('storeSlug') storeSlug: string, @Body() input: CreateContactRequestDto, @Req() request: Request) { return this.publicService.createContactRequest(storeSlug, input, request.ip ?? 'unknown'); }
}
