/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { ItemDetailInfo } from './taobao.interface';
import { ApiTaobaoService } from './apiTaobao.service';

@Injectable()
export class TaobaoService {
  constructor(private readonly apiTaobaoService: ApiTaobaoService) {}
  async getItemDetailById(
    itemId: number,
    pvid?: string[] | string,
  ): Promise<ItemDetailInfo> {
    const item = await this.apiTaobaoService.getItemDetailFromTaobao(itemId);
    let skuItem = {};
    if (pvid && item.skus && item.sku_props) {
      const pvInRightOrder = Array.isArray(pvid)
        ? this.getPvIdInRightOrder(pvid, item)
        : pvid;
      skuItem = item.skus.find((value) => {
        return value.props_ids === pvInRightOrder;
      });
    }
    return {
      ...item,
      sale_price: item.price_info.price,
      ...skuItem,
    };
  }
  private getPvIdInRightOrder(pvid: string[], item): string {
    const pvInRightOrderArr = [];
    const parseArr = pvid.map((x) => x.split(':')[0]);
    for (const id of item.sku_props) {
      const index = parseArr.findIndex((item) => item === id.pid);
      pvInRightOrderArr.push(pvid[index]);
    }
    return pvInRightOrderArr.join(';');
  }
}
