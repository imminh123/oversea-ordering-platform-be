import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { CompletePurchaseDto, PurchaseDto } from './payment.dto';

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
  ) {
    return this.paymentService.purchase(purchaseDto, userId);
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
}
