import type { StoreStatus, StoreMemberRole } from '@prisma/client';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  auth?: AuthIdentity;
  tenantId?: string;
}

export interface AuthIdentity {
  userId: string;
  email: string;
  isPlatformAdmin: boolean;
  role: StoreMemberRole | null;
  storeId: string | null;
  storeStatus: StoreStatus | null;
}
