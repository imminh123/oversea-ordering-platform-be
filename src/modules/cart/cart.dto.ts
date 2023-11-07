import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddItemToCartDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'def',
    required: true,
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: String,
    example: '1627207:19761432',
    required: true,
  })
  pvid?: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Number,
    example: 1,
    required: true,
  })
  volume?: number;
}
