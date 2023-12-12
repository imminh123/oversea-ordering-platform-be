import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { AuthenticationService } from '../authentication.service';
import {
  UserIdDto,
  AdminIndexAuthenDto,
  DeleteUserIdDto,
  CreateAdminUserDto,
  AdminUpdateClientAuthenDto,
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

@Controller('admin/authentication')
@ApiTags('AdminAuthentication')
@ApiBearerAuth('access-token')
export class AdminAuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Roles(Role.Root)
  @Post()
  @ApiOperation({
    operationId: 'createAdminUser',
    description: 'Create new admin user',
    summary: 'Create new admin user',
  })
  create(@Body() createUserDto: CreateAdminUserDto) {
    return this.authenticationService.createAdminUser(createUserDto);
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
    return this.authenticationService.adminIndexAuthen(
      adminIndexAuthenDto,
      pagination,
    );
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
    operationId: 'adminUpdateUserById',
    description: 'Admin update user by id',
    summary: 'Admin update user by id',
  })
  @Put(':id')
  updateOne(
    @Param() { id }: UserIdDto,
    @Body() updateUserAuthDto: AdminUpdateClientAuthenDto,
    @User(UserDataJwtProperties.USERID) adminId: string,
  ) {
    return this.authenticationService.adminUpdateUserAuth(
      id,
      adminId,
      updateUserAuthDto,
    );
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
