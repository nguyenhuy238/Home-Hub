import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/auth.types';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.auth?.storeId || request.auth.role !== 'OWNER') throw new ForbiddenException('Chỉ OWNER mới có quyền này');
    if (request.auth.storeStatus !== 'ACTIVE') throw new ForbiddenException('Cửa hàng đang bị tạm khóa');
    request.tenantId = request.auth.storeId;
    return true;
  }
}
