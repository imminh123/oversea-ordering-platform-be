/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { Novu } from '@novu/node';
import { NotificationEvent } from './novu.enum';
import { getConfig } from '../../shared/config/config.provider';

@Injectable()
export class NovuApiService {
  static NOVU;
  constructor() {
    NovuApiService.NOVU = this.getNovu();
  }

  async triggerNotification(
    data: object,
    event: NotificationEvent,
    userId: string,
  ) {
    return NovuApiService.NOVU.trigger('subscribers-notification', {
      to: {
        subscriberId: userId,
      },
      payload: {
        event,
        data,
      },
    });
  }
  private getNovu() {
    return new Novu(String(getConfig().get('novuConfig.apiToken')));
  }
}
