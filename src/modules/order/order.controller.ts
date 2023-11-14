import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { CreateOrderDto } from './order.dto';
import { Roles } from '../../decorators/authorization.decorator';
import { ApiOperation } from '@nestjs/swagger';
import { Role } from '../../shared/constant';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientCreateOrder',
    description: 'Client create order',
    summary: 'Client create order',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.orderService.createOrder(createOrderDto, userId);
  }

  // @Get()
  // @Roles(Role.Client)
  // @ApiOperation({
  //   operationId: 'ClientIndexOrder',
  //   description: 'Admin index order',
  //   summary: 'Admin index order',
  // })
  // async adminIndexOrder() {
  //   return;
  // }

  @Get(':id')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'getOrderById',
    description: 'Get order by id',
    summary: 'Get order by id',
  })
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById;
  }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() updateOrderDto: any) {
  //   return;
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return;
  // }
}
