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

@Module({
  imports: [
    DatabaseModule,
    DiscoveryModule,
    AuthenticationModule,
    CartModule,
    VariablesModule,
    OrderModule,
    PaymentModule,
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
