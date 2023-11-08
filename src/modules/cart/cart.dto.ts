import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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

export class GetSummaryCartDto {
  @IsArray()
  @IsNotEmpty()
  @Transform((x) => {
    return x.value.split(',');
  })
  @ApiProperty({
    type: String,
    example: '64bd70033bffa3a83b0a9b57',
  })
  ids: string[];
}
