import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import {
  ClientIndexOrderDto,
  CreateOrderDto,
  ReCreateOrderDto,
  UpdateStatusOrderDto,
} from './order.dto';
import { Roles } from '../../decorators/authorization.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, WebAdminRole } from '../../shared/constant';
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
  async clientCreateOrderAndPay(
    @Body() createOrderDto: CreateOrderDto,
    @User(UserDataJwtProperties.USERID) userId: string,
    @User(UserDataJwtProperties.USERNAME) userName: string,
  ) {
    return this.orderService.clientCreateOrderAndPay(createOrderDto, {
      userId,
      userName,
    });
  }

  @Post('createOrder')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientCreateOrder',
    description: 'Client create order',
    summary: 'Client create order',
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @User(UserDataJwtProperties.USERID) userId: string,
    @User(UserDataJwtProperties.USERNAME) userName: string,
  ) {
    return this.orderService.clientCreateOrder(createOrderDto, {
      userId,
      userName,
    });
  }

  @Post('reCreateOrderAndPay')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientReCreateOrderAndPay',
    description: 'Client reCreate order and pay',
    summary: 'Client reCreate order and pay',
  })
  async clientReCreateOrderAndPay(
    @Body() createOrderDto: ReCreateOrderDto,
    @User(UserDataJwtProperties.USERID) userId: string,
    @User(UserDataJwtProperties.USERNAME) userName: string,
  ) {
    return this.orderService.clientReCreateOrderAndPay(createOrderDto, {
      userId,
      userName,
    });
  }

  @Post('reCreateOrder')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientReCreateOrder',
    description: 'Client reCreate order',
    summary: 'Client recreate order',
  })
  async reCreateOrder(
    @Body() createOrderDto: ReCreateOrderDto,
    @User(UserDataJwtProperties.USERID) userId: string,
    @User(UserDataJwtProperties.USERNAME) userName: string,
  ) {
    return this.orderService.clientReCreateOrder(createOrderDto, {
      userId,
      userName,
    });
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
    @Query() indexOrderDto: ClientIndexOrderDto,
  ) {
    return this.orderService.indexOrders(indexOrderDto, pagination, userId);
  }

  @Get('admin')
  @Roles(...WebAdminRole)
  @CommonQueryRequest()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    operationId: 'adminIndexOrder',
    description: 'Admin index order',
    summary: 'Admin index order',
  })
  async adminIndexOrder(
    @Pagination() pagination: IPagination,
    @Query() indexOrderDto: ClientIndexOrderDto,
  ) {
    return this.orderService.indexOrders(indexOrderDto, pagination);
  }

  @Get(':id')
  @Roles(...WebAdminRole, Role.Client)
  @ApiOperation({
    operationId: 'getOrderById',
    description: 'Get order by id',
    summary: 'Get order by id',
  })
  async getOrderById(@Param('id') id: string) {
    return this.orderService.getOrderById(id);
  }

  @Post('updateStatus/:id')
  @Roles(...WebAdminRole)
  @ApiOperation({
    operationId: 'adminUpdateStatusOrder',
    description: 'Admin update status order',
    summary: 'Admin update status order',
  })
  async adminUpdateStatusOrder(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateStatusOrderDto,
  ) {
    return this.orderService.updateOrderStatus(id, {
      ...updateOrderStatusDto,
      updatedBy: userId,
    });
  }
}
