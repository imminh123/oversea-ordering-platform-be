import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  Put,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';
import { CommonQueryRequest } from '../../shared/swagger.helper';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';

@Controller('address')
@ApiTags('address')
@ApiBearerAuth('access-token')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'clientCreateAddress',
    description: 'Client create address',
    summary: 'Client create address',
  })
  createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @User(UserDataJwtProperties.USERID) userId: string,
  ) {
    return this.addressService.createAddress(createAddressDto, userId);
  }

  @Get()
  @Roles(Role.Client)
  @CommonQueryRequest()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    operationId: 'ClientIndexAddress',
    description: 'Client index address',
    summary: 'Client index address',
  })
  clientIndexAddress(
    @Query() clientIndexOrderDto: CreateAddressDto,
    @User(UserDataJwtProperties.USERID) userId: string,
    @Pagination() pagination: IPagination,
  ) {
    return this.addressService.indexDocuments(
      clientIndexOrderDto,
      pagination,
      userId,
    );
  }
  @Get(':id')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'getAddressById',
    description: 'Get address by id',
    summary: 'Get address by id',
  })
  async getAddressById(@Param('id') id: string) {
    return this.addressService.getDocumentById(id);
  }

  @Put(':id')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'updateAddressById',
    description: 'Update address by id',
    summary: 'Update address by id',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.updateAddressById(id, updateAddressDto);
  }

  @Delete(':id')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'removeAddressById',
    description: 'Remove address by id',
    summary: 'Remove address by id',
  })
  async remove(@Param('id') id: string) {
    return this.addressService.removeDocumentById(id);
  }
}
