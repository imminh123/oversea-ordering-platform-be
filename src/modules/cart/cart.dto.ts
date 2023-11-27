import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';

export class AddItemToCartDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform((x) => {
    if (!Boolean(Number(x.value))) {
      throw new BadRequestException('Invalid id');
    }
    return Number(x.value);
  })
  @ApiProperty({
    type: String,
    example: '123',
    required: true,
  })
  id: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Array,
    example: ['1627207:19761432'],
    required: true,
  })
  pvid?: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @ApiProperty({
    type: Array,
    example: '5114568770711',
    required: true,
  })
  skuId?: string;

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

export class UpdateCartItemDto {
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

export class GetDetailTaobaoItemDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform((x) => {
    if (!Boolean(Number(x.value))) {
      throw new BadRequestException('Invalid id');
    }
    return Number(x.value);
  })
  @ApiProperty({
    type: String,
    example: '123',
    required: false,
  })
  id: number;
}
