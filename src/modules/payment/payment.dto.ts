import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from './payment.enum';

export class CompletePurchaseDto {
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_TmnCode: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_Amount: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_BankCode: string;
  @ApiProperty({
    type: String,
    example: '',
    required: false,
  })
  vnp_BankTranNo: string;
  @ApiProperty({
    type: String,
    example: '',
    required: false,
  })
  vnp_CardType: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_PayDate: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_OrderInfo: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_TransactionNo: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_ResponseCode: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_TransactionStatus: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_TxnRef: string;
  @ApiProperty({
    type: String,
    example: '',
    required: false,
  })
  vnp_SecureHashType: string;
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  vnp_SecureHash: string;
}

export class PurchaseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  referenceId: string;
}

export class GetQrDto {
  @ApiProperty({
    type: Number,
    example: 0,
    required: true,
  })
  amount: number;

  @ApiProperty({
    type: String,
    example: '',
    required: true,
  })
  addInfo: string;
}

export class AdminIndexPaymentDto {
  @ApiProperty({
    type: String,
    enum: PaymentStatus,
    required: false,
  })
  status?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  userId?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  userName?: string;

  @IsOptional()
  @ApiProperty({
    type: Date,
    example: '2023-12-07T16:00:00.000Z',
    required: false,
  })
  timeFrom?: Date;

  @IsOptional()
  @ApiProperty({
    type: Date,
    example: '2023-12-08T16:00:00.000Z',
    required: false,
  })
  timeTo?: Date;
}
