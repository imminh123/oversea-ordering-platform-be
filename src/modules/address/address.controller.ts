import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';
import { CreateAddressDto, UpdateAddressDto } from './address.dto';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';

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
  @ApiOperation({
    operationId: 'ClientIndexAddress',
    description: 'Client index address',
    summary: 'Client index address',
  })
  clientIndexAddress(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.addressService.indexDocuments(userId);
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
  update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressService.updateAddressById(id, updateAddressDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.addressService.remove(+id);
  // }
}
