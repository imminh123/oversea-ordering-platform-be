import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DbModel } from '../../shared/constant';
import { IAuthSchema } from './authentication.schema';
import { AuthenticationRepository } from './authentication.repository';
import { HttpModule } from '@nestjs/axios';
import { OAuthService } from './oauth.service';
import { SessionController } from './controllers/session.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DbModel.Auth, schema: IAuthSchema }]),
    HttpModule,
    MailModule,
  ],
  controllers: [AuthenticationController, SessionController],
  providers: [AuthenticationService, AuthenticationRepository, OAuthService],
  exports: [AuthenticationService, AuthenticationRepository],
})
export class AuthenticationModule {}
