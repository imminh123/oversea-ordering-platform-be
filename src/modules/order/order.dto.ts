import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
