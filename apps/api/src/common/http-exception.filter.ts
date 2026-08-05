import { randomUUID } from 'node:crypto';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : null;
    const rawMessage = typeof raw === 'string' ? raw : raw && typeof raw === 'object' && 'message' in raw ? raw.message : 'Đã xảy ra lỗi không xác định';
    const message = Array.isArray(rawMessage) ? rawMessage.join('; ') : String(rawMessage);
    const code = status === 400 ? 'VALIDATION_ERROR' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : status === 409 ? 'CONFLICT' : status === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR';
    response.status(status).json({ error: { code, message, details: status === 400 && Array.isArray(rawMessage) ? rawMessage : null, requestId: request.headers['x-request-id'] ?? randomUUID() } });
  }
}
