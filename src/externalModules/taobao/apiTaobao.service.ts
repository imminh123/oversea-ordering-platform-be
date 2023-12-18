/* istanbul ignore file */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getConfig } from '../../shared/config/config.provider';
import axios from 'axios';
import { EndpointEnum, SortOption } from './taobao.enum';
import { SearchByImage, SearchItemDtoV2, SearchItemDtoV3 } from './tabao.dto';

const config = getConfig();
const tmApiToken = config.get('tmApiToken');
const rapidApiKey = config.get('rapidApiToken');
const emptyResult = {
  result: {
    resultList: [],
    base: { pageSize: 0, totalResults: 0 },
  },
};

const emptyResultV2 = {
  items: [],
  page: 1,
  total_items_count: 0,
};
@Injectable()
export class ApiTaobaoService {
  async getItemDetailFromTaobao(id: number) {
    const options = {
      method: 'GET',
      url: EndpointEnum.GetItemDetail,
      params: { apiToken: tmApiToken, item_id: id },
    };
    try {
      const { data } = await axios.request(options);
      if (data.code === 404) {
        return null;
      }
      return data.data;
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('Không thể lấy item từ taobao');
    }
  }

  async searchItemTaobao(text: string, page: number) {
    const options = {
      method: 'GET',
      url: EndpointEnum.SearchItem,
      params: { q: text, sort: SortOption.ratingDesc, page: String(page) },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'taobao-advanced.p.rapidapi.com',
      },
    };
    try {
      const { data } = await axios.request(options);
      if (data.result.status.data === 'error') {
        return emptyResult;
      }
      return data;
    } catch (error) {
      Logger.error(error);
      return emptyResult;
    }
  }

  async getItemDetailFromTaobaoV2(id: string) {
    const options = {
      method: 'GET',
      url: EndpointEnum.GetItemDetailV2,
      params: { num_iid: id, api: 'item_detail' },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'taobao-advanced.p.rapidapi.com',
      },
    };
    try {
      const { data } = await axios.request(options);
      return data.result.item;
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }

  async getItemDetailFromTaobaoV3(id: number) {
    const options = {
      method: 'GET',
      url: EndpointEnum.GetItemDetailV3,
      params: { itemId: String(id) },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'taobao-tmall-Tao-Bao-data-service.p.rapidapi.com',
      },
    };
    try {
      Logger.log(`Get taobao item with id ${id}`);
      const { data } = await axios.request(options);
      if ([404, 409, 429, 503, 504, 505].includes(data.status)) {
        return null;
      }
      Logger.log(`Get taobao item with id ${id} successful`);
      return data.Data;
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }

  async searchItemTaobaoV2(params: SearchItemDtoV2) {
    const options = {
      method: 'GET',
      url: EndpointEnum.SearchItemV2,
      params: {
        api: 'item_search',
        ...params,
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'taobao-api.p.rapidapi.com',
      },
    };
    try {
      const { data } = await axios.request(options);
      if (data.result.status.data === 'error') {
        return emptyResult;
      }
      return data;
    } catch (error) {
      Logger.error(error);
      return emptyResult;
    }
  }

  async searchItemTaobaoV3(params: SearchItemDtoV3) {
    const options = {
      method: 'GET',
      url: EndpointEnum.SearchItemV3,
      params: {
        ...params,
        query: params.q,
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'taobao-tmall-Tao-Bao-data-service.p.rapidapi.com',
      },
    };
    try {
      const { data } = await axios.request(options);
      if (data.status === 404) {
        return emptyResultV2;
      }
      return data;
    } catch (error) {
      Logger.error(error);
      return emptyResultV2;
    }
  }

  async searchItemByImageTaobao(imageUrl: string, params: SearchByImage) {
    const options = {
      method: 'GET',
      url: EndpointEnum.SearchByImage,
      params: {
        ...params,
        imageUrl,
      },
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'taobao-tmall-Tao-Bao-data-service.p.rapidapi.com',
      },
    };
    try {
      const { data } = await axios.request(options);
      if (data.status === 404) {
        return emptyResultV2;
      }
      return data;
    } catch (error) {
      Logger.error(error);
      return emptyResultV2;
    }
  }
}
