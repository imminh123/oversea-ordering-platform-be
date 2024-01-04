/* istanbul ignore file */
import { Injectable } from '@nestjs/common';
import { NovuApiService } from './novu.api.service';
import { NotificationEvent } from './novu.enum';

@Injectable()
export class NovuService {
  constructor(private readonly novuApiService: NovuApiService) {}

  async testNotification(userId, data) {
    this.novuApiService.triggerNotification(
      data,
      NotificationEvent.CreateOrderSuccess,
      userId,
    );
  }

  async triggerNotification({
    event,
    userId,
    data,
  }: {
    event: NotificationEvent;
    userId: string;
    data: object;
  }) {
    this.novuApiService.triggerNotification(data, event, userId);
  }
}
