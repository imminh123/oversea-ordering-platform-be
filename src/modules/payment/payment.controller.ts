import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import {
  AdminIndexPaymentDto,
  CompletePurchaseDto,
  GetQrDto,
  PurchaseDto,
} from './payment.dto';
import { Roles } from '../../decorators/authorization.decorator';
import { CommonQueryRequest } from '../../shared/swagger.helper';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { Pagination } from '../../decorators/pagination.decorator';
import { Role, WebAdminRole } from '../../shared/constant';
import { Response } from 'express';

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

  @Get('admin/download')
  @Roles(...WebAdminRole)
  @ApiOperation({
    operationId: 'adminDownloadListOrder',
    description: 'Admin Download list order',
    summary: 'Admin Download list order',
  })
  async adminDownloadListOrder(
    @Query() indexPaymentDto: AdminIndexPaymentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.paymentService.downloadListOrders(indexPaymentDto);
    const current = new Date();
    res.set({
      'Content-Type': 'application/csv',
      'Content-Disposition': `attachment; filename="Payment ${current.getTime()}.csv"`,
    });
    return new StreamableFile(data);
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

  @Get('listBank')
  @Roles(...WebAdminRole)
  @ApiOperation({
    operationId: 'adminGetListBank',
    description: 'Admin get list bank',
    summary: 'Admin get list bank',
  })
  async adminGetListBank() {
    return this.paymentService.getListBankSupportedVietQr();
  }

  @Get('getQr')
  @Roles(Role.Client, ...WebAdminRole)
  @ApiOperation({
    operationId: 'userGetQR',
    description: 'User get QR',
    summary: 'User get QR',
  })
  async adminGetQR(@Query() getQrDto: GetQrDto) {
    return this.paymentService.getQr(getQrDto);
  }

  @Get(':id')
  @Roles(Role.Client, ...WebAdminRole)
  @ApiOperation({
    operationId: 'userGetPaymentById',
    description: 'User get payment by id',
    summary: 'User get payment by id',
  })
  async clientGetOrderById(@Param('id') id: string) {
    return this.paymentService.userGetOrderById(id);
  }
}
