import { Controller, Post, Body, Put } from '@nestjs/common';
import { AuthenticationService } from '../authentication.service';
import {
  CreateSessionTokenDto,
  RefreshTokenDto,
  CreateSessionWithOAuth2Dto,
} from '../authentication.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  User,
  UserDataJwtProperties,
} from '../../../decorators/user.decorator';
import { Roles } from '../../../decorators/authorization.decorator';
import { Role } from '../../../shared/constant';

@Controller('session')
@ApiTags('session')
@ApiBearerAuth('access-token')
export class SessionController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  // @Post('adminCreateSession')
  // @ApiOperation({
  //   operationId: 'createAdminSession',
  //   description: 'Create admin session',
  //   summary: 'Create admin session',
  // })
  // createAdminSessionToken(
  //   @Body() createSessionDto: CreateAdminSessionTokenDto,
  // ) {
  //   return this.authenticationService.createAdminSession(createSessionDto);
  // }

  @Post('createClientSession')
  @ApiOperation({
    operationId: 'createClientSession',
    description: 'Create client session',
    summary: 'Create client session',
  })
  createSessionToken(@Body() createSessionDto: CreateSessionTokenDto) {
    return this.authenticationService.createSession(createSessionDto);
  }

  @Post('createSessionWithOAuth2')
  @ApiOperation({
    operationId: 'createSessionWithOAuth2',
    description: 'Create client session with OAuth2',
    summary: 'Create client session with OAuth2',
  })
  createSessionWithOAuth2(
    @Body() createSessionDto: CreateSessionWithOAuth2Dto,
  ) {
    return this.authenticationService.createSessionWithOAuth2(createSessionDto);
  }

  @Roles(Role.Client)
  @Put('updateOAuth')
  @ApiOperation({
    operationId: 'updateOAuthInfo',
    description: 'Update linking account OAuth2',
    summary: 'Update linking account OAuth2',
  })
  updateOauth(
    @User(UserDataJwtProperties.USERID) userId: string,
    @Body() createSessionDto: CreateSessionWithOAuth2Dto,
  ) {
    return this.authenticationService.updateOAuth(createSessionDto, userId);
  }

  @Post('refreshSession')
  @ApiOperation({
    operationId: 'refreshUserSession',
    description: 'Refresh user session',
    summary: 'Refresh user session',
  })
  refreshSessionToken(@Body() { token }: RefreshTokenDto) {
    return this.authenticationService.refreshSession(token);
  }
}
