import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentMerchant = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest<{ merchantId?: string }>();
    if (!request.merchantId) throw new UnauthorizedException();
    return request.merchantId;
  },
);
