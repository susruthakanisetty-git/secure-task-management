import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface AppUser { userId: string; email: string; orgId?: string | null }
export const UserCtx = createParamDecorator((_data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as AppUser | undefined;
});
