import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, AuthIdentity } from './auth.types';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthIdentity => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  if (!request.auth) {
    throw new Error('Authenticated user is missing');
  }
  return request.auth;
});
