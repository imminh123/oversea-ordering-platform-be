import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: '',
  })
  orderInfo: string;
}
