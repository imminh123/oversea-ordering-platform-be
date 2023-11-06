import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DatabaseModule } from './modules/database/database.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { UserMiddleware } from './middleware/user.middleware';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './shared/roles.guard';
import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [DatabaseModule, DiscoveryModule, AuthenticationModule, CartModule],
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
