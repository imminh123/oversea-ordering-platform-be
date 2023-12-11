import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { Model } from 'mongoose';
import { BaseRepository } from '../../shared/database/base-repository';
import { ICartDocument } from './cart.interface';

export class CartRepository
  extends BaseRepository<ICartDocument>
  implements OnApplicationBootstrap
{
  constructor(@InjectModel(DbModel.Cart) model: Model<ICartDocument>) {
    super(model);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.createCollection();
  }

  async getClientCart(
    userId: string,
    arr?: string[],
  ): Promise<
    {
      _id: string;
      shopName: string;
      shopUrl: string;
      listItem: {
        id: string;
        itemId: number;
        itemName: string;
        itemUrl: string;
        skuId: string;
        propName: string;
        isActive: boolean;
        price: number;
        vnPrice?: string;
        quantity: number;
        updatedAt: Date;
      }[];
    }[]
  > {
    return this.model
      .aggregate([
        arr
          ? {
              $match: {
                userId,
                _id: { $in: arr },
              },
            }
          : {
              $match: {
                userId,
              },
            },
        {
          $sort: {
            shopId: 1,
            itemId: 1,
            skuId: 1,
          },
        },
        {
          $group: {
            _id: '$shopId',
            shopName: {
              $first: '$shopName',
            },
            shopUrl: {
              $first: '$shopUrl',
            },
            listItem: {
              $push: {
                id: '$_id',
                itemId: '$itemId',
                itemName: '$itemName',
                itemUrl: '$itemUrl',
                itemImage: { $arrayElemAt: ['$image', 0] },
                skuId: '$skuId',
                propName: '$propName',
                isActive: '$isActive',
                price: '$price',
                quantity: '$quantity',
                updatedAt: '$updatedAt',
              },
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ])
      .exec();
  }

  async listingDistinctItemId(userId: string) {
    return this.model
      .aggregate([
        {
          $match: {
            userId,
          },
        },
        {
          $group: {
            _id: '$itemId',
          },
        },
      ])
      .exec();
  }
}
