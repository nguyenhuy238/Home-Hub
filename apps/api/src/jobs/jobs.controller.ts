import { Controller, ForbiddenException, Headers, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeadAnonymizationService } from '../leads/lead-anonymization.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly config: ConfigService, private readonly anonymization: LeadAnonymizationService) {}

  @Post('anonymize-leads')
  async anonymizeLeads(@Headers('x-cron-secret') cronSecret?: string) {
    const expected = this.config.get<string>('CRON_SECRET');
    if (!expected || cronSecret !== expected) throw new ForbiddenException('Invalid cron secret');
    return { data: await this.anonymization.anonymizeDueLeads() };
  }
}
