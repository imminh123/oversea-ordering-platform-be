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
  GetSummaryCartDto,
  UpdateCartItemDto,
} from './cart.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';
import { CartListingFilter } from './cart.interface';

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

  @Get('v2')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientGetCartV2',
    description: 'Client get cart v2',
    summary: 'Client get cart v2',
  })
  clientGetCartV2(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.cartService.clientGetCartV2(userId);
  }

  // @Get('getTbItem')
  // @Roles(Role.Client)
  // @ApiOperation({
  //   operationId: 'clientGetTaobaoItem',
  //   description: 'Client get detail taobao item',
  //   summary: 'Client get detail taobao item',
  // })
  // clientGetTaobaoItem(@Query() getDetailTaobaoItemDto: GetDetailTaobaoItemDto) {
  //   return this.cartService.clientGetDetailTaobaoItem(getDetailTaobaoItemDto);
  // }

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
  getSummaryCart(@Query() { ids }: GetSummaryCartDto) {
    return this.cartService.getSummaryCart(ids);
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
