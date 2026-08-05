import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactNotificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadNotificationService {
  private readonly logger = new Logger(LeadNotificationService.name);

  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async notify(contactRequestId: string): Promise<void> {
    const request = await this.prisma.contactRequest.findUnique({ where: { id: contactRequestId }, include: { store: { include: { settings: true } }, product: { select: { name: true } } } });
    if (!request || request.notificationStatus === ContactNotificationStatus.SENT) return;
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('EMAIL_FROM');
    const recipient = request.store.ownerContactEmail ?? request.store.settings?.email;
    if (!apiKey || !from || !recipient) {
      this.logger.warn(`Lead ${contactRequestId} remains pending because email configuration or recipient is missing`);
      return;
    }

    await this.prisma.contactRequest.update({ where: { id: contactRequestId }, data: { notificationAttempts: { increment: 1 } } });
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [recipient], subject: `Liên hệ mới tại ${request.store.name}`, html: this.renderHtml(request.store.name, request.customerName, request.customerPhone, request.customerEmail, request.message, request.product?.name) }),
      });
      if (!response.ok) throw new Error(`Resend returned ${response.status}`);
      await this.prisma.contactRequest.update({ where: { id: contactRequestId }, data: { notificationStatus: ContactNotificationStatus.SENT, notificationSentAt: new Date() } });
    } catch (error) {
      this.logger.error(`Could not send lead notification ${contactRequestId}`, error instanceof Error ? error.stack : undefined);
      await this.prisma.contactRequest.update({ where: { id: contactRequestId }, data: { notificationStatus: ContactNotificationStatus.FAILED } });
    }
  }

  private renderHtml(storeName: string, customerName: string, phone: string, email: string | null, message: string, productName: string | undefined) {
    const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    return `<h2>Liên hệ mới tại ${escape(storeName)}</h2><p><strong>Khách hàng:</strong> ${escape(customerName)}</p><p><strong>Số điện thoại:</strong> ${escape(phone)}</p>${email ? `<p><strong>Email:</strong> ${escape(email)}</p>` : ''}${productName ? `<p><strong>Sản phẩm:</strong> ${escape(productName)}</p>` : ''}<p><strong>Nội dung:</strong></p><p>${escape(message).replaceAll('\n', '<br>')}</p>`;
  }
}
