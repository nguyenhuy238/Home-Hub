import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module';
import { JobsController } from './jobs.controller';

@Module({ imports: [LeadsModule], controllers: [JobsController] })
export class JobsModule {}
