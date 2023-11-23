/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { ItemDetailInfo } from './taobao.interface';
import { ApiTaobaoService } from './apiTaobao.service';
import { db2api } from '../../shared/helpers';
import { getHeaders } from '../../adapters/pagination/pagination.helper';

@Injectable()
export class TaobaoService {
  constructor(private readonly apiTaobaoService: ApiTaobaoService) {}
  async getItemDetailById(
    itemId: number,
    pvid?: string[] | string,
    skuId?: string,
  ): Promise<ItemDetailInfo> {
    const item = await this.apiTaobaoService.getItemDetailFromTaobao(itemId);
    let skuItem = {};
    if (item.skus && item.sku_props) {
      if (skuId) {
        skuItem = item.skus.find((value) => {
          return value.skuid === skuId;
        });
      } else if (pvid) {
        const pvInRightOrder = Array.isArray(pvid)
          ? this.getPvIdInRightOrder(pvid, item)
          : pvid;
        skuItem = item.skus.find((value) => {
          return value.props_ids === pvInRightOrder;
        });
      }
    }
    return {
      ...item,
      sale_price: item.price_info.price,
      ...skuItem,
    };
  }

  async searchItem(text: string, page: number) {
    return this.apiTaobaoService.searchItemTaobao(text, page);
  }

  async getItemDetailByIdV2(
    itemId: number,
    pvid?: string[] | string,
    skuId?: string,
  ): Promise<ItemDetailInfo> {
    const item = await this.apiTaobaoService.getItemDetailFromTaobaoV2(
      String(itemId),
    );
    let skuItem = {};
    if (item.skus && item.sku_props) {
      if (skuId) {
        skuItem = item.skus.find((value) => {
          return value.skuid === skuId;
        });
      } else if (pvid) {
        const pvInRightOrder = Array.isArray(pvid)
          ? this.getPvIdInRightOrder(pvid, item)
          : pvid;
        skuItem = item.skus.find((value) => {
          return value.props_ids === pvInRightOrder;
        });
      }
    }
    return {
      ...item,
      sale_price: item.skus[0].price,
      ...skuItem,
    };
  }

  async directSearchItemTaobao(id: string, page: number) {
    const listItems = await this.apiTaobaoService.searchItemTaobao(id, page);
    const {
      result: {
        resultList: items,
        base: { pageSize: perPage, totalResults: listLength },
      },
    } = listItems;
    const responseHeader = getHeaders({ page, perPage }, listLength);

    return {
      items,
      headers: responseHeader,
    };
  }

  async directGetDetailItemV1(id: number) {
    return this.apiTaobaoService.getItemDetailFromTaobao(id);
  }

  async directGetDetailItemV2(id: string) {
    return this.apiTaobaoService.getItemDetailFromTaobaoV2(id);
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
