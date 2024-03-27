import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AddItemToCartDto,
  CartListingFilter,
  GetSummaryCartDto,
  UpdateCartItemDto,
} from './cart.dto';
import { TaobaoService } from '../../externalModules/taobao/taobao.service';
import { ICart, ICartDocument } from './cart.interface';
import Decimal from 'decimal.js';
import * as _ from 'lodash';
import { CartRepository } from './cart.repository';
import { Errors } from '../../shared/errors/errors';
import { addTime, db2api, isAfter } from '../../shared/helpers';
import { ItemDetailInfo } from '../../externalModules/taobao/taobao.interface';
import { isValidObjectId } from 'mongoose';
import { ObjectId } from 'bson';
import { VariablesService } from '../variables/variables.service';
import { Variables } from '../variables/variables.helper';
import { setConfigCacheTime } from './cart.helper';

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
    const item = await this.tbService.getItemDetailByIdV2(id, pvid, skuId);
    if (!item) {
      throw new BadRequestException({
        ...Errors.TAOBAO_ITEM_WITH_GIVEN_ID_NOT_EXITS,
        method: `${CartService.name}:${this.addItemToClientCart.name}`,
      });
    }
    console.log(item);
    const cartItem = this.convertResponseFromTaobaoItem({
      item,
      volume,
      userId,
    });
    const findItem = await this.cartRepository.findOne(
      { userId, itemId: cartItem.itemId, skuId: cartItem.skuId },
      { sort: { createdAt: -1 } },
    );
    console.log(cartItem);

    if (!findItem) {
      return this.cartRepository.create(cartItem);
    }
    cartItem.quantity += findItem.quantity;
    return this.cartRepository.updateById(findItem.id, cartItem);
  }

  async clientGetCart(
    filters: CartListingFilter,
    userId: string,
  ): Promise<ICart[] | number> {
    const { cartIds } = filters;
    const findParam: any = { userId };
    if (!_.isEmpty(cartIds)) {
      findParam._id = { $in: cartIds };
    }
    const cart = await this.cartRepository.find(findParam, {
      sort: { createdAt: -1 },
    });
    this.refreshClientCart(userId, setConfigCacheTime)
      .then()
      .catch((err) => {
        console.log(err);
      });
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

    return itemsResponse;
  }

  async countCart(userId: string): Promise<number> {
    return this.cartRepository.count({ userId });
  }

  async refreshClientCart(
    userId: string,
    cacheTimeInHour = 0,
  ): Promise<ICart[]> {
    const cart = await this.cartRepository.find(
      { userId },
      {
        sort: { createdAt: -1 },
      },
    );
    const listUpdateVoid = [];
    const mockTime = addTime(new Date(), -1 * cacheTimeInHour, 'hour');
    for (const cartItem of cart) {
      const isUpdate = isAfter(mockTime, cartItem.updatedAt, 0);
      const item = await this.tbService.getItemDetailByIdV2(
        cartItem.itemId,
        undefined,
        cartItem.skuId,
        mockTime,
      );
      if (!item || item.quantity === 0) {
        if (isUpdate) {
          listUpdateVoid.push(
            this.cartRepository.updateById(cartItem.id, {
              isActive: false,
            }),
          );
        }
        continue;
      }
      const updateItem = this.convertResponseFromTaobaoItem({
        item,
        userId: cartItem.userId,
        volume: cartItem.quantity,
      });
      if (isUpdate) {
        listUpdateVoid.push(
          this.cartRepository.updateById(cartItem.id, {
            ...updateItem,
            isActive: true,
          }),
        );
      }
    }
    return Promise.all(listUpdateVoid);
  }

  async getSummaryCart(
    userId: string,
    ids: string[],
    haveCountingFee: boolean,
  ) {
    const arr = [];
    ids.forEach((id) => {
      if (isValidObjectId(id)) {
        arr.push(new ObjectId(id));
      }
    });
    const groupItemByShop = await this.cartRepository.getClientCart(
      userId,
      arr,
    );
    const countShop = groupItemByShop.length;
    if (countShop === 0) {
      return 0;
    }
    let countItem = 0;
    let totalInCNY = new Decimal(0);
    for (const { listItem } of groupItemByShop) {
      for (const item of listItem) {
        if (item.isActive) {
          countItem++;
          const num = new Decimal(item.price).mul(item.quantity);
          totalInCNY = totalInCNY.add(num);
        }
      }
    }
    const rate = await this.variablesService.getVariable(
      Variables.EXCHANGE_RATE,
    );
    if (!rate) {
      throw new NotFoundException('Can not get exchange rate');
    }
    totalInCNY = totalInCNY.toDP(2);
    const feeVariable =
      (await this.variablesService.getVariable(Variables.FEE)) || 0;
    const feePerOrder = new Decimal(feeVariable).mul(rate).toDP(3);
    const countingFeeVarieble =
      (await this.variablesService.getVariable(Variables.FEE)) || 0;
    const countingFee = haveCountingFee
      ? new Decimal(countingFeeVarieble).mul(rate).toDP(3)
      : new Decimal(0);

    return this.calculateBreakdownDetail({
      totalInCNY,
      rate,
      feePerOrder,
      countShop,
      countingFee,
      countItem,
    });
  }

  async calculateBreakdownDetail({
    totalInCNY,
    rate,
    feePerOrder,
    countShop,
    countingFee,
    countItem,
  }: {
    totalInCNY: Decimal;
    rate: string | number | Decimal;
    feePerOrder: Decimal;
    countShop: number;
    countingFee: Decimal;
    countItem: number;
  }) {
    const totalInVND = totalInCNY.mul(rate).toDP(3);
    const totalFeeOrder = feePerOrder.mul(countShop).toDP(3);
    const totalCountingFee = countingFee.mul(countItem).toDP(3);
    const finalTotal = totalInVND
      .add(totalFeeOrder)
      .add(totalCountingFee)
      .toDP(3);
    return {
      totalInCNY,
      exchangeRate: rate,
      totalInVND,
      feePerOrder,
      countOrder: countShop,
      totalFeeOrder,
      countingFee,
      countItem,
      totalCountingFee,
      finalTotal,
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
        'Không thể tìm thấy hàng hóa này trong giỏ hàng',
      );
    }

    if (!item.isActive) {
      throw new BadRequestException('Hàng hóa này hiện không tồn tại');
    }

    return this.cartRepository.updateById(id, { ...updateCartItemDto });
  }

  async getListCartItem(ids: string[]): Promise<ICartDocument[]> {
    ids.map((item) => new ObjectId(item));
    return this.cartRepository.find({ _id: { $in: ids } });
  }

  async clientGetCartV2({ ids }: GetSummaryCartDto, userId: string) {
    const arr = [];
    if (ids && ids.length > 0) {
      for (const id of ids) {
        if (isValidObjectId(id)) {
          arr.push(new ObjectId(id));
        }
      }
    }
    const cart = await this.cartRepository.getClientCart(
      userId,
      arr.length > 0 ? arr : undefined,
    );
    const rate = await this.variablesService.getVariable(
      Variables.EXCHANGE_RATE,
    );
    if (!rate) {
      throw new NotFoundException('Không thể lấy giá nhân dân tệ');
    }
    this.refreshClientCart(userId, 1)
      .then()
      .catch((err) => {
        console.log(err);
      });
    for (const { listItem } of cart) {
      for (const cartItem of listItem) {
        cartItem.vnPrice = new Decimal(cartItem.price)
          .mul(rate)
          .toDP(3)
          .toString();
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
      quantity: Math.min(volume, item.quantity),
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
