/* istanbul ignore file */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ItemDetailInfo } from './taobao.interface';
import { ApiTaobaoService } from './apiTaobao.service';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { SearchItemDtoV2, SearchItemDtoV3 } from './tabao.dto';

@Injectable()
export class TaobaoService {
  constructor(private readonly apiTaobaoService: ApiTaobaoService) {}
  async getItemDetailById(
    itemId: number,
    pvid?: string[] | string,
    skuId?: string,
  ): Promise<ItemDetailInfo> {
    const item = await this.apiTaobaoService.getItemDetailFromTaobao(itemId);
    if (!item) {
      return null;
    }
    let skuItem;

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
      if ((skuId || pvid) && !skuItem) {
        throw new BadRequestException(
          'Không thể tìm thấy hàng hóa trên taobao',
        );
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
    let skuItem;
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
      if ((skuId || pvid) && !skuItem) {
        throw new BadRequestException(
          'Không thể tìm thấy hàng hóa trên taobao',
        );
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

  async directSearchItemTaobaoV2(searchDto: SearchItemDtoV2) {
    const listItems = await this.apiTaobaoService.searchItemTaobaoV2(searchDto);
    const {
      result: {
        item: items,
        page,
        page_size: perPage,
        total_results: listLength,
      },
    } = listItems;
    const responseHeader = getHeaders(
      { page: Number(page), perPage: Number(perPage) },
      Number(listLength),
    );

    return {
      items,
      headers: responseHeader,
    };
  }

  async directSearchItemTaobaoV3(searchDto: SearchItemDtoV3) {
    const listItems = await this.apiTaobaoService.searchItemTaobaoV3(searchDto);
    const { items, page, max_page, total_items_count: listLength } = listItems;
    const responseHeader = getHeaders(
      { page: page, perPage: items.length },
      listLength,
    );
    if (responseHeader['x-pages-count'] > max_page) {
      responseHeader['x-pages-count'] = max_page;
      responseHeader['x-next-page'] -= 1;
    }

    return {
      items,
      headers: responseHeader,
    };
  }

  async directGetDetailItemV1(id: number) {
    const item = await this.apiTaobaoService.getItemDetailFromTaobao(id);
    if (!item) {
      throw new BadRequestException('Không thể tìm thấy hàng hóa trên taobao');
    }
    return item;
  }

  async directGetDetailItemV2(id: string) {
    const item = await this.apiTaobaoService.getItemDetailFromTaobaoV2(id);
    if (!item) {
      throw new BadRequestException('Không thể tìm thấy hàng hóa trên taobao');
    }
    return item;
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
