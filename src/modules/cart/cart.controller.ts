import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemToCartDto, GetSummaryCartDto } from './cart.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { CommonQueryRequest } from '../../shared/swagger.helper';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';

@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({
    operationId: 'addItemToClientCart',
    description: 'Add item to client cart',
    summary: 'Add item to client cart',
  })
  addItemToUserCart(
    @Body() createCartDto: AddItemToCartDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.cartService.addItemToClientCart(createCartDto, userId);
  }

  @Get()
  @CommonQueryRequest()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    operationId: 'clientGetCart',
    description: 'Client get cart',
    summary: 'Client get cart',
  })
  clientGetCart(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Pagination() pagination: IPagination,
  ) {
    return this.cartService.clientGetCart(userId, pagination);
  }

  @Put('refreshCart')
  @ApiOperation({
    operationId: 'refreshClientCart',
    description: 'Refresh client cart',
    summary: 'Refresh client cart',
  })
  refreshCart(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.cartService.refreshClientCart(userId);
  }

  @Get('calculateSummaryCart')
  @ApiOperation({
    operationId: 'calculateSummaryCart',
    description: 'Calculate summary cart',
    summary: 'Calculate summary cart',
  })
  getSummaryCart(@Query() { ids }: GetSummaryCartDto) {
    return this.cartService.getSummaryCart(ids);
  }

  @Delete('')
  @ApiOperation({
    operationId: 'deleteCartItem',
    description: 'Delete cart item',
    summary: 'Delete cart item',
  })
  deleteCartItem(@Body() { ids }: GetSummaryCartDto) {
    return this.cartService.delete(ids);
  }
}
