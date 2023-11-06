/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { getConfig } from '../../modules/config/config.provider';
import { ItemDetailInfo } from './taobao.interface';

const config = getConfig();
@Injectable()
export class TaobaoService {
  public getItemDetailById(itemId: string, pvid?: string): ItemDetailInfo {
    const item = this.getItemDetailFromTaobao(itemId);
    let skuItem = {};
    if (pvid) {
      skuItem = item.skus.find((value) => value.props_ids === pvid);
    }
    return {
      ...item,
      sale_price: item.price_info.price,
      ...skuItem,
    };
  }

  private getItemDetailFromTaobao(id: string) {
    return {
      item_id: 682042505030,
      product_url: 'https://item.taobao.com/item.htm?id=682042505030',
      title: '法国MKins女包520情人节七夕母亲节圣诞节送老婆女友闺蜜生日礼物',
      main_imgs: [
        'https://gd2.alicdn.com/imgextra/i3/2910384334/O1CN01aHvZlZ1ht1LI1Oevd_!!2910384334.jpg',
        'https://gd1.alicdn.com/imgextra/i1/2910384334/O1CN01I579zj1ht1KJ3Zoy8_!!2910384334.jpg',
        'https://gd3.alicdn.com/imgextra/i3/2910384334/O1CN019xMeA41ht1K8IlxZ3_!!2910384334.jpg',
        'https://gd2.alicdn.com/imgextra/i2/2910384334/O1CN01XM5Hd51ht1KBMuyJ8_!!2910384334.jpg',
        'https://gd1.alicdn.com/imgextra/i1/2910384334/O1CN01qILIMG1ht1KCtinL8_!!2910384334.jpg',
      ],
      video_url:
        'http://cloud.video.taobao.com/play/u/p/1/e/6/t/1/374223637617.mp4',
      currency: 'CNY',
      price_info: {
        price: '311.0',
        origin_price: '311.0',
      },
      shop_info: {
        shop_id: '163216017',
        seller_id: 2910384334,
        shop_name: 'CaringKleing轻奢代购',
        shop_url: 'https://shop163216017.taobao.com',
      },
      sku_props: [
        {
          pid: '1627207',
          prop_name: '颜色分类',
          values: [
            {
              vid: '19761432',
              name: '蓝配白',
              imageUrl:
                'https://gd3.alicdn.com/imgextra/i4/2910384334/O1CN014S8oYf1ht1KBMsDVh_!!2910384334.jpg',
            },
            {
              vid: '19758489',
              name: '绿配白',
              imageUrl:
                'https://gd3.alicdn.com/imgextra/i4/2910384334/O1CN01sqapxf1ht1K64dxNc_!!2910384334.jpg',
            },
            {
              vid: '11125089',
              name: '白配黑',
              imageUrl:
                'https://gd3.alicdn.com/imgextra/i3/2910384334/O1CN017Vogbd1ht1K64dLwS_!!2910384334.jpg',
            },
            {
              vid: '9324927',
              name: '纯米白',
              imageUrl:
                'https://gd4.alicdn.com/imgextra/i4/2910384334/O1CN01czviru1ht1KAaThvH_!!2910384334.jpg',
            },
            {
              vid: '12038984',
              name: '黑配白',
              imageUrl:
                'https://gd4.alicdn.com/imgextra/i1/2910384334/O1CN01Fy1UtL1ht1KBMrgLt_!!2910384334.jpg',
            },
            {
              vid: '67054689',
              name: '白配绿',
              imageUrl:
                'https://gd1.alicdn.com/imgextra/i4/2910384334/O1CN01SsSddP1ht1K8IhfHm_!!2910384334.jpg',
            },
          ],
        },
      ],
      skus: [
        {
          skuid: '5058128667550',
          sale_price: '311.0',
          origin_price: '999.0',
          stock: 200,
          props_ids: '1627207:19761432',
          props_names: '颜色分类:蓝配白',
          sub_price: null,
          sub_price_type: '',
        },
        {
          skuid: '5058128667551',
          sale_price: '311.0',
          origin_price: '999.0',
          stock: 200,
          props_ids: '1627207:19758489',
          props_names: '颜色分类:绿配白',
          sub_price: null,
          sub_price_type: '',
        },
        {
          skuid: '5058128667552',
          sale_price: '400.0',
          origin_price: '999.0',
          stock: 200,
          props_ids: '1627207:11125089',
          props_names: '颜色分类:白配黑',
          sub_price: null,
          sub_price_type: '',
        },
        {
          skuid: '5058128667553',
          sale_price: '311.0',
          origin_price: '999.0',
          stock: 200,
          props_ids: '1627207:9324927',
          props_names: '颜色分类:纯米白',
          sub_price: null,
          sub_price_type: '',
        },
        {
          skuid: '5058128667554',
          sale_price: '311.0',
          origin_price: '999.0',
          stock: 200,
          props_ids: '1627207:12038984',
          props_names: '颜色分类:黑配白',
          sub_price: null,
          sub_price_type: '',
        },
        {
          skuid: '5058128667555',
          sale_price: '311.0',
          origin_price: '999.0',
          stock: 200,
          props_ids: '1627207:67054689',
          props_names: '颜色分类:白配绿',
          sub_price: null,
          sub_price_type: '',
        },
      ],
      extra: 'False',
    };
  }
}
