/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { ItemDetailInfo } from './taobao.interface';
import { ApiTaobaoService } from './apiTaobao.service';

@Injectable()
export class TaobaoService {
  constructor(private readonly apiTaobaoService: ApiTaobaoService) {}
  async getItemDetailById(
    itemId: number,
    pvid?: string,
  ): Promise<ItemDetailInfo> {
    const item = await this.apiTaobaoService.getItemDetailFromTaobao(itemId);
    let skuItem = {};
    if (pvid && item.skus) {
      skuItem = item.skus.find((value) => value.props_ids === pvid);
    }
    return {
      ...item,
      sale_price: item.price_info.price,
      ...skuItem,
    };
  }
}
