/* istanbul ignore file */
import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { ISearchDetail, ItemDetailInfo } from './taobao.interface';
import { ApiTaobaoService } from './apiTaobao.service';
import { getHeaders } from '../../adapters/pagination/pagination.helper';
import { SearchByImage, SearchItemDtoV2, SearchItemDtoV3 } from './tabao.dto';
import { CacheItemRepository } from './taobao.repository';
import { buildFilterDateParam } from '../../shared/helpers';
import * as fs from 'fs';
import { getConfig, getHost } from '../../shared/config/config.provider';

@Injectable()
export class TaobaoService {
  constructor(
    private readonly apiTaobaoService: ApiTaobaoService,
    private readonly cacheItemRepository: CacheItemRepository,
  ) {}
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

  async getItemDetailByIdV2(
    itemId: number,
    pvid?: string[] | string,
    skuId?: string,
    date?: Date,
  ): Promise<ItemDetailInfo> {
    let item;
    const findParams: any = { itemId };
    if (date) {
      findParams.createdAt = buildFilterDateParam(date);
    }
    const cacheItem = await this.cacheItemRepository.findOne(findParams, {
      sort: { createdAt: -1 },
    });
    if (cacheItem) {
      item = cacheItem.detail;
    } else {
      item = await this.apiTaobaoService.getItemDetailFromTaobaoV2(
        String(itemId),
      );
      if (!item) {
        return null;
      }
      await this.cacheItemRepository.create({ itemId, detail: item });
    }
    let skuItem;
    const main_imgs = [];
    if (item?.skus?.sku) {
      if (skuId) {
        skuItem = item.skus.sku.find((value) => {
          return value.sku_id === skuId;
        });
      } else if (pvid) {
        const pvInRightOrder = Array.isArray(pvid)
          ? this.getPvIdInRightOrder(pvid, item)
          : pvid;
        console.log(pvInRightOrder);
        skuItem = item.skus.sku.find((value) => {
          return value.properties === pvInRightOrder;
        });
      }
      if ((skuId || pvid) && !skuItem) {
        return null;
      }
    }
    main_imgs.push(...item.item_imgs.map((img) => `${img.url}`));
    const props_names = [];
    if (skuItem?.properties_name && skuItem?.properties) {
      const pvId = skuItem.properties.split(';');
      const rawName = item.properties_name.split(';');
      for (let i = 0; i < pvId.length; i++) {
        props_names.push(rawName.split(`${pvId}:`));
      }
    }

    return {
      item_id: item?.num_iid,
      product_url: `https://item.taobao.com/item.htm?id=${item?.num_iid}`,
      title: item?.title,
      video_url: item?.video?.url,
      shop_info: {
        shop_id: item?.shop_id,
        seller_id: item?.seller_id,
        shop_name: item?.seller_info?.shop_name,
        shop_url: item?.seller_info?.zhuy,
      },
      props_names: props_names.join(';'),
      props_ids: skuItem?.properties,
      quantity: skuItem?.price && skuItem?.quantity ? skuItem?.quantity : 0,
      sale_price: skuItem?.price,
      main_imgs,
      skuid: skuItem?.sku_id,
    };
  }

  async getItemDetailByIdV3(
    itemId: number,
    pvid?: string[] | string,
    skuId?: string,
    date?: Date,
  ): Promise<ItemDetailInfo> {
    let item;
    const findParams: any = { itemId };
    if (date) {
      findParams.createdAt = buildFilterDateParam(date);
    }
    const cacheItem = await this.cacheItemRepository.findOne(findParams, {
      sort: { createdAt: -1 },
    });
    if (cacheItem) {
      item = cacheItem.detail;
    } else {
      item = await this.apiTaobaoService.getItemDetailFromTaobaoV3(itemId);
      if (!item) {
        return null;
      }
      await this.cacheItemRepository.create({ itemId, detail: item });
    }
    let skuItem;
    const main_imgs = [];
    if (item.SkuMaps && item.SkuProps) {
      if (skuId) {
        skuItem = item.SkuMaps.find((value) => {
          return value?.SkuId === skuId;
        });
      } else if (pvid) {
        const pvInRightOrder = Array.isArray(pvid)
          ? this.getPvIdInRightOrderV3(pvid, item)
          : pvid;
        skuItem = item.SkuMaps.find((value) => {
          return value?.Key === pvInRightOrder;
        });
      }
      if ((skuId || pvid) && !skuItem) {
        return null;
      }
      if (skuItem.ImageUrl) {
        main_imgs.push(skuItem.ImageUrl);
      }
    }
    main_imgs.push(...item.ImageUrls.map((url) => `https:${url}`));
    const propName = [];
    if (skuItem?.SpecAttributes) {
      for (const [key, value] of Object.entries(skuItem.SpecAttributes)) {
        propName.push(`${key}: ${value}`);
      }
    }

    return {
      item_id: item?.OfferId,
      product_url: `https://item.taobao.com/item.htm?id=${item?.OfferId}`,
      title: item?.Subject,
      video_url: item?.MainImageVideo,
      shop_info: {
        shop_id: item?.ShopId,
        seller_id: item?.UserId,
        shop_name: item?.ShopName,
        shop_url: `${item.ShopUrl}.taobao.com`,
      },
      props_names: propName.join('; '),
      props_ids: skuItem?.Key,
      quantity: skuItem?.AmountOnSale || item?.AmountOnSale,
      sale_price:
        skuItem?.Price ||
        skuItem?.original_price ||
        item?.PriceRangeInfos[0]?.Price,
      main_imgs,
      skuid: skuItem?.SkuId,
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
    const { itemsArray: items, page } = listItems;
    const responseHeader = getHeaders(
      { page: page, perPage: items.length },
      page.totalResults,
    );
    const result = [];
    items.map((item) => {
      result.push({
        ...item,
        num_iid: item.item_id,
        original_price: item.view_price,
        price: item.view_price,
        quantity: item.view_sales,
      });
    });
    if (responseHeader['x-pages-count'] > page?.totalPages) {
      responseHeader['x-pages-count'] = page?.totalPages;
      responseHeader['x-next-page'] -= 1;
    }

    return {
      items: result,
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

  async directGetDetailItemV2(id: string): Promise<ISearchDetail> {
    const item = await this.apiTaobaoService.getItemDetailFromTaobaoV2(id);
    if (!item) {
      throw new BadRequestException('Không thể tìm thấy hàng hóa trên taobao');
    }
    const main_imgs = [];
    main_imgs.push(...item.item_imgs.map((img) => `${img.url}`));
    const SkuProps = [];
    const props_list = Object.entries(
      item.props_list as Record<string, string>,
    );
    let props_detail = [];
    let prevKey;
    let prevName;
    for (let index = 0; index < props_list.length; index++) {
      const [key, value] = props_list[index];
      const splitKey = key.split(':');
      const splitValue = value.split(':');
      if (
        index === props_list.length - 1 ||
        (prevKey && splitKey[0] !== prevKey)
      ) {
        if (index === props_list.length - 1) {
          props_detail.push({
            value: key,
            name: splitValue[1],
            imageUrl: '',
          });
        }
        SkuProps.push({
          IsImg: false,
          Prop: prevName || splitValue[0],
          Value: props_detail,
        });
        props_detail = [];
      }
      props_detail.push({
        value: key,
        name: splitValue[1],
        imageUrl: '',
      });
      prevKey = splitKey[0];
      prevName = splitValue[0];
    }
    const ProductFeatures: any = {};
    (item.props as Array<{ name: string; value: string }>).forEach(
      ({ name, value }) => {
        ProductFeatures[`${name}`] = value;
      },
    );
    return {
      CategoryId: item?.num_iid,
      OfferId: item?.num_iid,
      Subject: item?.title,
      ImageUrls: main_imgs,
      MainImageVideo: item?.video?.url,
      PriceRangeInfos: [
        {
          Price: item.price,
          ConvertPrice: item.price,
        },
      ],
      OriginalPriceRangeInfos: [
        {
          Price: item.orginal_price,
          ConvertPrice: item.orginal_price,
        },
      ],
      ProductFeatures,
      Delivery: {},
      ShopInfo: item.seller_info,
      ShopId: item?.shop_id,
      SkuProps,
      SkuMaps: item?.skus?.sku,
      AmountOnSale: item?.price && item?.num ? item.num : 0,
      Detail: `https://item.taobao.com/item.htm?id=${item?.num_iid}`,
      ShopName: item?.seller_info?.shop_name,
      ShopUrl: item?.seller_info?.zhuy,
    };
  }

  async directGetDetailItemV3(id: number) {
    const item = await this.apiTaobaoService.getItemDetailFromTaobaoV3(id);
    if (!item) {
      throw new BadRequestException('Không thể tìm thấy hàng hóa trên taobao');
    }
    await this.cacheItemRepository.create({ itemId: id, detail: item });
    return item;
  }

  async searchItemByImage(
    userId: string,
    image: Express.Multer.File,
    searchDto: SearchByImage,
  ) {
    try {
      const { buffer } = image;
      const type = 'png';
      const endpoint = `http://${getHost()}${getConfig().get(
        'service.baseUrl',
      )}/taobao/image/${type}/${userId}`;
      const path = `${process.cwd()}/searchImages/${userId}.${type}`;
      if (fs.existsSync(path)) {
        fs.unlink(path, (err) => {
          if (err) {
            throw err;
          }
          console.log(`Delete old image search of user ${userId} success`);
        });
      }

      return await new Promise((resolve, reject) => {
        fs.writeFile(path, buffer, async (err) => {
          try {
            if (err) throw err;
            const listItems =
              await this.apiTaobaoService.searchItemByImageTaobao(
                endpoint,
                searchDto,
              );
            const { itemsArray: items, pageSize } = listItems;
            const result = [];
            items.map((item) => {
              result.push({
                ...item,
                detail_url: `//item.taobao.com/item.htm?id=${item.item_id}&ns=1&abbucket=0#detail`,
                pic_url: String(item.pic_path).slice(5),
                num_iid: item.item_id,
                original_price: item.price,
                price: item.priceWap,
                quantity: item.sold,
              });
            });
            const responseHeader = getHeaders(
              { page: Number(searchDto.page), perPage: pageSize },
              pageSize,
            );
            if (responseHeader['x-pages-count'] > 1) {
              responseHeader['x-pages-count'] = 1;
              responseHeader['x-next-page'] -= 1;
            }
            resolve({
              items: result,
              headers: responseHeader,
            });
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.log(
        `Tìm kiếm theo ảnh thất bại do lỗi: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }

  async getImage(fileName: string, type: string) {
    const path = `${process.cwd()}/searchImages/${fileName}.${type}`;
    if (!fs.existsSync(path)) {
      throw new BadRequestException('Không tìm thấy ảnh');
    }
    const file = fs.createReadStream(path);
    file.on('error', (err) => {
      throw err;
    });
    return new StreamableFile(file);
  }

  private getPvIdInRightOrder(pvid: string[], item): string {
    const pvInRightOrderArr = [];
    const parseArr = pvid.map((x) => x.split(':')[0]);
    if (parseArr.length === 1) {
      return parseArr[0];
    }
    for (const id of item.skus.sku) {
      const index = parseArr.findIndex((item) => item === id.pid);
      pvInRightOrderArr.push(pvid[index]);
    }
    return pvInRightOrderArr.join(';');
  }

  private getPvIdInRightOrderV3(pvid: string[], item): string {
    const pvInRightOrderArr = [];
    const parseArr = pvid.map((x) => x.split(':')[0]);
    for (const prop of item.SkuProps) {
      const id = prop.Value[0].value.split(':')[0];
      const index = parseArr.findIndex((findItem) => {
        return findItem === id;
      });
      pvInRightOrderArr.push(pvid[index]);
    }
    return pvInRightOrderArr.join(';');
  }
}
