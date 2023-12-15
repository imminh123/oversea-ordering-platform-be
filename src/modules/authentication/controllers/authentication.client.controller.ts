import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { AuthenticationService } from '../authentication.service';
import {
  CreateClientUserDto,
  ChangePasswordDto,
  UpdateAuthDto,
  UpdateOAuthDto,
} from '../authentication.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, WebAdminRole } from '../../../shared/constant';
import { Roles } from '../../../decorators/authorization.decorator';
import {
  User,
  UserDataJwtProperties,
} from '../../../decorators/user.decorator';
import { SkipJwtAuth } from '../../../decorators/skip_jwt_auth';

@Controller('authentication')
@ApiTags('authentication')
@ApiBearerAuth('access-token')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post()
  @ApiOperation({
    operationId: 'createClientUser',
    description: 'Create new client user',
    summary: 'Create new client user',
  })
  create(@Body() createUserDto: CreateClientUserDto) {
    return this.authenticationService.createClientUser(createUserDto);
  }

  @Post('register/:token')
  @ApiOperation({
    operationId: 'clientActiveAccount',
    description: 'Client active registered account',
    summary: 'Client active registered account',
  })
  @SkipJwtAuth()
  activeAccount(@Param('token') token: string) {
    return this.authenticationService.registerUser(token);
  }

  @Roles(Role.Client, Role.Admin)
  @ApiOperation({
    operationId: 'userUpdateAuth',
    description: 'User update auth',
    summary: 'User update auth',
  })
  @Put('')
  updateAuth(
    @Body() updateAuthDto: UpdateAuthDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.authenticationService.updateAuthInfo(updateAuthDto, userId);
  }

  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientUpdateOAuth',
    description: 'Client update Oauth',
    summary: 'Client update Oauth',
  })
  @Put('')
  updateOAuth(
    @Body() updateOAuthDto: UpdateOAuthDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.authenticationService.deleteOAuthInfo(updateOAuthDto, userId);
  }

  @Roles(Role.Client, Role.Admin)
  @ApiOperation({
    operationId: 'userChangePassword',
    description: 'User change password',
    summary: 'User change password',
  })
  @Put('changePassword')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.authenticationService.changePassword(changePasswordDto, userId);
  }

  @ApiOperation({
    operationId: 'userGetAuthInfo',
    description: 'User get auth info',
    summary: 'User get auth info',
  })
  @Get('client')
  @Roles(...WebAdminRole, Role.Client)
  userGetInfo(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.authenticationService.getUserById(userId);
  }
}
