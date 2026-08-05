import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadAnonymizationService } from './lead-anonymization.service';
import { LeadNotificationService } from './lead-notification.service';

@Module({ imports: [PrismaModule], providers: [LeadNotificationService, LeadAnonymizationService], exports: [LeadNotificationService, LeadAnonymizationService] })
export class LeadsModule {}
