import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { AuthenticationService } from '../authentication.service';
import {
  CreateUserDto,
  UserIdDto,
  ChangePasswordDto,
  UpdateAuthDto,
  AdminIndexAuthenDto,
  DeleteUserIdDto,
  UpdateOAuthDto,
} from '../authentication.dto';
import { CommonQueryRequest } from '../../../shared/swagger.helper';
import { Pagination } from '../../../decorators/pagination.decorator';
import { IPagination } from '../../../adapters/pagination/pagination.interface';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, WebAdminRole } from '../../../shared/constant';
import { Roles } from '../../../decorators/authorization.decorator';
import {
  User,
  UserDataJwtProperties,
} from '../../../decorators/user.decorator';
import { OAuthService } from '../oauth.service';
import { SkipJwtAuth } from '../../../decorators/skip_jwt_auth';

@Controller('authentication')
@ApiTags('authentication')
@ApiBearerAuth('access-token')
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly oauthService: OAuthService,
  ) {}

  @Post()
  @ApiOperation({
    operationId: 'createClientUser',
    description: 'Create new client user',
    summary: 'Create new client user',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authenticationService.createUser(createUserDto);
  }

  @Post('register/:token')
  @ApiOperation({
    operationId: 'activeAccount',
    description: 'Active registered account',
    summary: 'Active registered account',
  })
  @SkipJwtAuth()
  activeAccount(@Param('token') token: string) {
    return this.authenticationService.registerUser(token);
  }

  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientUpdateAuth',
    description: 'Client update auth',
    summary: 'Client update auth',
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

  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientChangePassword',
    description: 'Client change password',
    summary: 'Client change password',
  })
  @Put('changePassword')
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.authenticationService.changePassword(changePasswordDto, userId);
  }

  @ApiOperation({
    operationId: 'clientGetAuthInfo',
    description: 'Client get auth info',
    summary: 'Client get auth info',
  })
  @Get('client')
  userGetInfo(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.authenticationService.getUserById(userId);
  }

  @Roles(...WebAdminRole)
  @CommonQueryRequest()
  @ApiOperation({
    operationId: 'adminIndexUsers',
    description: 'Admin index users',
    summary: 'Admin index users',
  })
  @Get()
  findAll(
    @Pagination() pagination: IPagination,
    @Query() adminIndexAuthenDto: AdminIndexAuthenDto,
  ) {
    return this.authenticationService.findAll(adminIndexAuthenDto, pagination);
  }

  @Roles(...WebAdminRole)
  @ApiOperation({
    operationId: 'adminGetUserById',
    description: 'Admin get user by id',
    summary: 'Admin get user by id',
  })
  @Get(':id')
  findOne(@Param() { id }: UserIdDto) {
    return this.authenticationService.getUserById(id);
  }

  @Roles(...WebAdminRole)
  @ApiOperation({
    operationId: 'adminDeleteListUser',
    description: 'Admin delete list user',
    summary: 'Admin delete list user',
  })
  @Delete('')
  deleteOne(@Body() { ids }: DeleteUserIdDto) {
    return this.authenticationService.deleteListUserId(ids);
  }
}
