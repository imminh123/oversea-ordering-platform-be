import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AddItemToCartDto,
  GetDetailTaobaoItemDto,
  UpdateCartItemDto,
} from './cart.dto';
import { TaobaoService } from '../../externalModules/taobao/taobao.service';
import { ICart, ICartDocument } from './cart.interface';
import Decimal from 'decimal.js';
import { CartRepository } from './cart.repository';
import { Errors } from '../../shared/errors/errors';
import {
  IPagination,
  IPaginationHeader,
} from '../../adapters/pagination/pagination.interface';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { db2api, isAfter } from '../../shared/helpers';
import { ItemDetailInfo } from '../../externalModules/taobao/taobao.interface';
import { isValidObjectId } from 'mongoose';
import { ObjectId } from 'bson';
import { VariablesService } from '../variables/variables.service';
import { Variables } from '../variables/variables.helper';

@Injectable()
export class CartService {
  constructor(
    private readonly tbService: TaobaoService,
    private readonly cartRepository: CartRepository,
    private readonly variablesService: VariablesService,
  ) {}
  async addItemToClientCart(
    { id, pvid, volume, skuId }: AddItemToCartDto,
    userId: string,
  ): Promise<ICart> {
    const item = await this.tbService.getItemDetailById(id, pvid, skuId);
    if (!item) {
      throw new BadRequestException({
        ...Errors.TAOBAO_ITEM_WITH_GIVEN_ID_NOT_EXITS,
        method: `${CartService.name}:${this.addItemToClientCart.name}`,
      });
    }
    const cartItem = this.convertResponseFromTaobaoItem({
      item,
      volume,
      userId,
    });
    const findItem = await this.cartRepository.findOne(
      { userId, itemId: cartItem.itemId, skuId: cartItem.skuId },
      { sort: { createdAt: -1 } },
    );

    if (!findItem) {
      return this.cartRepository.create(cartItem);
    }
    cartItem.quantity += findItem.quantity;
    return this.cartRepository.updateById(findItem.id, cartItem);
  }

  async clientGetCart(
    userId: string,
    pagination: IPagination,
  ): Promise<{ items: ICart[]; headers: IPaginationHeader }> {
    const cart = await this.cartRepository.find(
      { userId },
      {
        skip: pagination.startIndex,
        limit: pagination.perPage,
        sort: { createdAt: -1 },
      },
    );
    const current = new Date();
    for (const cartItem of cart) {
      if (isAfter(cartItem.updatedAt, current, 60)) {
        continue;
      }
      const item = await this.cartRepository.findOne(
        { itemId: cartItem.itemId, skuId: cartItem.skuId },
        { sort: { updatedAt: -1 } },
      );
      if (item && isAfter(item.updatedAt, current, 60)) {
        cartItem.updatedAt = item.updatedAt;
        cartItem.price = item.price;
        cartItem.propName = item.propName;
        cartItem.isActive = item.isActive;
        cartItem.save();
        continue;
      }
      const newItem = await this.tbService.getItemDetailById(
        cartItem.itemId,
        undefined,
        cartItem.skuId,
      );
      cartItem.updatedAt = current;
      if (!newItem) {
        cartItem.isActive = false;
        cartItem.save();
        continue;
      }
      cartItem.price = new Decimal(newItem.sale_price).toNumber();
      cartItem.propName = newItem.props_names;
      cartItem.save();
    }
    const rate = await this.variablesService.getVariable(
      Variables.EXCHANGE_RATE,
    );
    if (!rate) {
      throw new NotFoundException('Can not get exchange rate');
    }
    const itemsResponse: any[] = [];
    for (const item of db2api<ICartDocument[], ICart[]>(cart)) {
      itemsResponse.push({
        ...item,
        vnPrice: new Decimal(item.price).mul(rate).toDP(3).toString(),
      });
    }

    const cartLength = await this.cartRepository.count({ userId });
    const responseHeader = getHeaders(pagination, cartLength);

    return {
      items: itemsResponse,
      headers: responseHeader,
    };
  }

  async refreshClientCart(userId: string): Promise<ICart[]> {
    const cart = await this.cartRepository.find(
      { userId },
      {
        sort: { createdAt: -1 },
      },
    );
    const listUpdateVoid = [];
    for (const cartItem of cart) {
      const item = await this.tbService.getItemDetailById(
        cartItem.itemId,
        undefined,
        cartItem.skuId,
      );
      if (!item) {
        listUpdateVoid.push(
          this.cartRepository.updateById(cartItem.id, { isActive: false }),
        );
        continue;
      }
      const updateItem = this.convertResponseFromTaobaoItem({
        item,
        userId: cartItem.userId,
        volume: cartItem.quantity,
      });
      listUpdateVoid.push(
        this.cartRepository.updateById(cartItem.id, updateItem),
      );
    }
    return Promise.all(listUpdateVoid);
  }

  async getSummaryCart(ids: string[]) {
    const arr = [];
    ids.forEach((id) => {
      if (isValidObjectId(id)) {
        arr.push(new ObjectId(id));
      }
    });
    const listItem = await this.cartRepository.find({ _id: { $in: arr } });
    if (listItem.length === 0) {
      return 0;
    }
    let res = new Decimal(0);
    for (const item of listItem) {
      if (item.isActive) {
        const num = new Decimal(item.price).mul(item.quantity);
        res = res.add(num);
      }
    }
    const rate = await this.variablesService.getVariable(
      Variables.EXCHANGE_RATE,
    );
    if (!rate) {
      throw new NotFoundException('Can not get exchange rate');
    }
    return {
      totalInCNY: res.toDP(2),
      exchangeRate: rate,
      totalInVND: res.mul(rate).toDP(3),
    };
  }

  async delete(ids: string[]) {
    const arr = [];
    ids.forEach((id) => {
      if (isValidObjectId(id)) {
        arr.push(new ObjectId(id));
      }
    });
    return this.cartRepository.delete({ _id: { $in: arr } });
  }

  async clientUpdateCartItem(
    updateCartItemDto: UpdateCartItemDto,
    userId: string,
    id: string,
  ) {
    const findParam: any = { userId, _id: new ObjectId(id) };
    const item = await this.cartRepository.findOne(findParam);
    if (!item) {
      throw new BadRequestException(
        'Not found item with given id belong to client',
      );
    }

    if (!item.isActive) {
      throw new BadRequestException('This item is currently unavailable');
    }

    return this.cartRepository.updateById(id, { ...updateCartItemDto });
  }

  async clientGetDetailTaobaoItem({ id }: GetDetailTaobaoItemDto) {
    return this.tbService.getItemDetailById(610980984514);
    // return this.tbService.searchItem('phone', 1);
  }

  async getListCartItem(ids: string[]): Promise<ICartDocument[]> {
    ids.map((item) => new ObjectId(item));
    return this.cartRepository.find({ _id: { $in: ids } });
  }

  async clientGetCartV2(userId: string) {
    const cart = await this.cartRepository.getClientCart(userId);
    const rate = await this.variablesService.getVariable(
      Variables.EXCHANGE_RATE,
    );
    if (!rate) {
      throw new NotFoundException('Can not get exchange rate');
    }
    const current = new Date();
    for (const { listItem } of cart) {
      for (const cartItem of listItem) {
        cartItem.vnPrice = new Decimal(cartItem.price)
          .mul(rate)
          .toDP(3)
          .toString();
        if (isAfter(cartItem.updatedAt, current, 60)) {
          continue;
        }
        const item = await this.cartRepository.findOne(
          { itemId: cartItem.itemId, skuId: cartItem.skuId },
          { sort: { updatedAt: -1 } },
        );
        if (item && isAfter(item.updatedAt, current, 60)) {
          cartItem.updatedAt = item.updatedAt;
          cartItem.price = item.price;
          cartItem.propName = item.propName;
          cartItem.isActive = item.isActive;
          cartItem.vnPrice = new Decimal(item.price)
            .mul(rate)
            .toDP(3)
            .toString();
          this.cartRepository.updateById(cartItem.id, cartItem);
          continue;
        }
        const newItem = await this.tbService.getItemDetailById(
          cartItem.itemId,
          undefined,
          cartItem.skuId,
        );
        cartItem.updatedAt = current;
        if (!newItem) {
          cartItem.isActive = false;
          this.cartRepository.updateById(cartItem.id, cartItem);
          continue;
        }
        cartItem.price = new Decimal(newItem.sale_price).toNumber();
        cartItem.propName = newItem.props_names;
        cartItem.vnPrice = new Decimal(item.price).mul(rate).toDP(3).toString();
        this.cartRepository.updateById(cartItem.id, cartItem);
      }
    }
    return cart;
  }

  private convertResponseFromTaobaoItem({
    item,
    volume,
    userId,
  }: {
    item: ItemDetailInfo;
    volume: number;
    userId: string;
  }): ICart {
    return {
      itemId: item.item_id,
      itemName: item.title,
      itemUrl: item.product_url,
      shopId: item.shop_info.shop_id,
      shopName: item.shop_info.shop_name,
      shopUrl: item.shop_info.shop_url,
      quantity: volume,
      price: new Decimal(item.sale_price).toDP(2).toNumber(),
      image: item.main_imgs,
      currency: item.currency,
      skuId: item.skuid,
      propName: item.props_names,
      isActive: true,
      userId,
    };
  }
}
