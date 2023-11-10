/* istanbul ignore file */
import { Injectable, Logger } from '@nestjs/common';
import { getConfig } from '../../modules/config/config.provider';
import axios from 'axios';
import { EndpointEnum } from './taobao.enum';

const config = getConfig();
const apiToken = config.get('tmApiToken');
@Injectable()
export class ApiTaobaoService {
  async getItemDetailFromTaobao(id: number) {
    const options = {
      method: 'GET',
      url: EndpointEnum.GetItemDetail,
      params: { apiToken, item_id: id },
    };
    try {
      const { data } = (await axios.request(options)).data;
      return data;
    } catch (error) {
      Logger.error(error);
      return null;
    }
  }
}
