import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddItemToCartDto } from '../cart/cart.dto';
import { mockItem } from './order.enum';

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddItemToCartDto)
  @ApiProperty({
    type: Array,
    example: [mockItem],
  })
  listItem: AddItemToCartDto[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
  })
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: '',
  })
  wareHouseAddress: string;
}
