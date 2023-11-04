import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { createPagination } from '../adapters/pagination/pagination.helper';

export const Pagination = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return createPagination(request.query.page, request.query.perPage);
  },
);
