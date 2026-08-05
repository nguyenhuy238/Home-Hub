import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadAnonymizationService {
  constructor(private readonly prisma: PrismaService) {}

  async anonymizeDueLeads(now = new Date()) {
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 12);
    const result = await this.prisma.contactRequest.updateMany({ where: { createdAt: { lte: cutoff }, anonymizedAt: null }, data: { customerName: 'Đã ẩn danh', customerPhone: 'Đã ẩn danh', customerEmail: null, message: 'Nội dung đã được ẩn danh theo chính sách lưu trữ.', anonymizedAt: now } });
    return { anonymized: result.count, cutoff: cutoff.toISOString() };
  }
}
