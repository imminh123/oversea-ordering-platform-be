import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus } from './order.enum';
import { Transform } from 'class-transformer';

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Vui lòng chọn danh sách sản phẩm' })
  @ApiProperty({
    type: Array,
    example: [],
  })
  listItemId: string[];

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn địa chỉ giao hàng' })
  @ApiProperty({
    type: String,
    example: 'def',
  })
  addressId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: '',
  })
  wareHouseAddress?: string;
}

export class ReCreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
  })
  orderId: string;
}

export class ClientIndexOrderDto {
  @ApiProperty({
    type: String,
    enum: OrderStatus,
    required: false,
  })
  status?: string;

  @ApiProperty({
    type: String,
    enum: OrderStatus,
    required: false,
  })
  userName?: string;

  @ApiProperty({
    type: String,
    enum: OrderStatus,
    required: false,
  })
  itemName?: string;

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

  @IsBoolean()
  @IsOptional()
  @Transform((data) => {
    return data.value === 'true';
  })
  @ApiProperty({
    type: Boolean,
    example: false,
    required: false,
  })
  onlyCount?: boolean;
}
export class UpdateStatusOrderDto {
  @IsString()
  @IsEnum(OrderStatus)
  @ApiProperty({
    type: String,
    enum: OrderStatus,
    example: OrderStatus.ON_HOLD,
  })
  status: OrderStatus;

  @IsObject()
  @ApiProperty({
    type: Object,
    example: {},
  })
  meta: any;
}
