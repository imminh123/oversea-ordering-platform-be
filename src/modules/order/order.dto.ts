import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({
    type: Array,
    example: [],
  })
  listItemId: string[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
  })
  addressId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: '',
  })
  wareHouseAddress: string;
}
