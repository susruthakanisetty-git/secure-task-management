import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the user payload from the request (populated by JwtAuthGuard)
 * Example: const user = ctx.user
 */
export const UserCtx = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // set by Passport JWT strategy
  },
);
