import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './controllers/authentication.client.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { IClientAuthSchema } from './authentication.schema';
import { AuthenticationRepository } from './authentication.repository';
import { HttpModule } from '@nestjs/axios';
import { OAuthService } from './oauth.service';
import { SessionController } from './controllers/session.controller';
import { MailModule } from '../mail/mail.module';
import { AdminAuthenticationController } from './controllers/authentication.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DbModel.Auth, schema: IClientAuthSchema },
    ]),
    HttpModule,
    MailModule,
  ],
  controllers: [
    AuthenticationController,
    SessionController,
    AdminAuthenticationController,
  ],
  providers: [AuthenticationService, AuthenticationRepository, OAuthService],
  exports: [AuthenticationService, AuthenticationRepository],
})
export class AuthenticationModule {}
