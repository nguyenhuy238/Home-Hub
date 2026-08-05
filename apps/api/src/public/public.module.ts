import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadsModule } from '../leads/leads.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({ imports: [PrismaModule, LeadsModule], controllers: [PublicController], providers: [PublicService], exports: [PublicService] })
export class PublicModule {}
