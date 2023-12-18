import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import {
  AdminIndexPaymentDto,
  CompletePurchaseDto,
  PurchaseDto,
} from './payment.dto';
import { Roles } from '../../decorators/authorization.decorator';
import { CommonQueryRequest } from '../../shared/swagger.helper';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { Pagination } from '../../decorators/pagination.decorator';
import { Role, WebAdminRole } from '../../shared/constant';

@Controller('payment')
@ApiTags('payment')
@ApiBearerAuth('access-token')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post()
  @ApiOperation({
    operationId: 'userPurchase',
    description: 'User purchase',
    summary: 'User purchase',
  })
  async purchase(
    @Body() purchaseDto: PurchaseDto,
    @User(UserDataJwtProperties.USERID) userId: string,
    @User(UserDataJwtProperties.USERNAME) userName: string,
  ) {
    return this.paymentService.purchase(purchaseDto, userId, userName);
  }

  @Get()
  @ApiOperation({
    operationId: 'completePurchase',
    description: 'Complete purchase',
    summary: 'Complete purchase',
  })
  async completePurchase(@Query() completePurchaseDto: CompletePurchaseDto) {
    return this.paymentService.completePurchase(completePurchaseDto);
  }

  @Get('admin')
  @Roles(...WebAdminRole)
  @CommonQueryRequest()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    operationId: 'adminIndexPayment',
    description: 'Admin index payment',
    summary: 'Admin index payment',
  })
  async adminIndexOrder(
    @Pagination() pagination: IPagination,
    @Query() indexOrderDto: AdminIndexPaymentDto,
  ) {
    return this.paymentService.adminIndexPaymentTransactions(
      indexOrderDto,
      pagination,
    );
  }

  @Get('clientIndexPayment')
  @Roles(Role.Client)
  @CommonQueryRequest()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    operationId: 'ClientIndexPayment',
    description: 'Client index payment',
    summary: 'Client index payment',
  })
  async clientIndexPayment(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Pagination() pagination: IPagination,
  ) {
    return this.paymentService.clientIndexPaymentTransactions(
      userId,
      pagination,
    );
  }
}
