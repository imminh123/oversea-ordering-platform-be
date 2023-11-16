import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { CreateOrderDto } from './order.dto';
import { Roles } from '../../decorators/authorization.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../../shared/constant';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { CommonQueryRequest } from '../../shared/swagger.helper';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';

@Controller('order')
@ApiTags('order')
@ApiBearerAuth('access-token')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientCreateOrderAndPay',
    description: 'Client create order and pay',
    summary: 'Client create order and pay',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.orderService.createOrderAndPay(createOrderDto, userId);
  }

  @Get()
  @Roles(Role.Client)
  @CommonQueryRequest()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    operationId: 'ClientIndexOrder',
    description: 'Client index order',
    summary: 'Client index order',
  })
  async clientIndexOrder(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Pagination() pagination: IPagination,
  ) {
    return this.orderService.indexOrders(userId, pagination);
  }

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
