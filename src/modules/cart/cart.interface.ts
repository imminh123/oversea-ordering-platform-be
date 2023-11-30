import { IsArray, IsOptional, IsString } from 'class-validator';
import { BaseDocument } from '../../shared/database/database.helpers';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { getParamsFromArrayQuery } from '../../shared/helpers';

export interface ICart {
  itemId: number;
  itemName: string;
  itemUrl: string;
  shopId: string;
  shopName: string;
  shopUrl: string;
  quantity: number;
  price: number;
  image: string[];
  currency?: string;
  skuId?: string;
  propName?: string;
  isActive: boolean;
  userId: string;
}
export interface ICartDocument extends ICart, BaseDocument {}

export class CartListingFilter {
  @IsOptional()
  @Transform(({ value }) => getParamsFromArrayQuery(value))
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({
    type: [String],
    description: 'Multiple cart item IDs',
  })
  cartIds?: string[];
}
