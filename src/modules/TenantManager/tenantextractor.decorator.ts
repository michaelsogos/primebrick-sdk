import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Tenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    switch (ctx.getType()) {
      case 'http':
        return ctx.switchToHttp().getRequest()['tenantAlias'];
      case 'rpc':
        return ctx.switchToRpc().getData()['tenantAlias'];
      case 'ws':
        throw new Error('Not implemented yet!');
    }
  },
);
