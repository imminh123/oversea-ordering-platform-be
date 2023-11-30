/* istanbul ignore file */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { getConfig } from '../../shared/config/config.provider';
import axios from 'axios';
import { EndpointEnum, SortOption } from './taobao.enum';

const config = getConfig();
const tmApiToken = config.get('tmApiToken');
const rapidApiKey = config.get('rapidApiToken');
const emptyResult = {
  result: {
    resultList: [],
    base: { pageSize: 0, totalResults: 0 },
  },
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
      const { data } = (await axios.request(options)).data;
      return data;
    } catch (error) {
      Logger.error(error);
      return null;
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
      console.log(JSON.stringify(data));
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
}
