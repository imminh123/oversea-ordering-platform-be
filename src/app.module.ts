import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { UserMiddleware } from './middleware/user.middleware';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './shared/roles.guard';
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { CartModule } from './modules/cart/cart.module';
import { VariablesModule } from './modules/variables/variables.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AddressModule } from './modules/address/address.module';
import { TaobaoModule } from './externalModules/taobao/taobao.module';
import { MailModule } from './modules/mail/mail.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NovuModule } from './externalModules/novu/novu.module';

@Module({
  imports: [
    DatabaseModule,
    DiscoveryModule,
    AuthenticationModule,
    CartModule,
    VariablesModule,
    OrderModule,
    PaymentModule,
    AddressModule,
    TaobaoModule,
    MailModule,
    DashboardModule,
    NovuModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
  constructor(private readonly discover: DiscoveryService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
