import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  AddItemToCartDto,
  CartListingFilter,
  ClientGetCartV2Dto,
  GetSummaryCartDto,
  UpdateCartItemDto,
} from './cart.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';

@Controller('cart')
@ApiTags('cart')
@ApiBearerAuth('access-token')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @Roles(Role.Client)
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
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientGetCart',
    description: 'Client get cart',
    summary: 'Client get cart',
  })
  clientGetCart(
    @Query() filters: CartListingFilter,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.cartService.clientGetCart(filters, userId);
  }

  @Get('count')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientCountCart',
    description: 'Client count cart',
    summary: 'Client count cart',
  })
  clientCountCart(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.cartService.countCart(userId);
  }

  @Get('v2')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientGetCartV2',
    description: 'Client get cart v2',
    summary: 'Client get cart v2',
  })
  clientGetCartV2(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Query() clientGetCartV2Dto: ClientGetCartV2Dto,
  ) {
    return this.cartService.clientGetCartV2(clientGetCartV2Dto, userId);
  }

  @Put('refreshCart')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'refreshClientCart',
    description: 'Refresh client cart',
    summary: 'Refresh client cart',
  })
  refreshCart(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.cartService.refreshClientCart(userId);
  }

  @Put(':id')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientUpdateCartItem',
    description: 'Client update cart item',
    summary: 'Client update cart item',
  })
  updateCartItem(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.clientUpdateCartItem(updateCartItemDto, userId, id);
  }

  @Get('calculateSummaryCart')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'calculateSummaryCart',
    description: 'Calculate summary cart',
    summary: 'Calculate summary cart',
  })
  getSummaryCart(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Query() { ids, haveCountingFee }: GetSummaryCartDto,
  ) {
    return this.cartService.getSummaryCart(userId, ids, haveCountingFee);
  }

  @Delete('')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'deleteCartItem',
    description: 'Delete cart item',
    summary: 'Delete cart item',
  })
  deleteCartItem(@Body() { ids }: GetSummaryCartDto) {
    return this.cartService.delete(ids);
  }
}
