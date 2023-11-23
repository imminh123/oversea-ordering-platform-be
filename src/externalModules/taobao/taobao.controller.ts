import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';
import { SearchItemDto } from './tabao.dto';
import { TaobaoService } from './taobao.service';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';

@Controller('taobao')
@ApiTags('Taobao')
@ApiBearerAuth('access-token')
export class TaobaoController {
  constructor(private readonly taobaoService: TaobaoService) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'searchTaobaoItem',
    description: 'Search taobao item',
    summary: 'Search taobao item',
  })
  clientIndexAddress(@Query() searchDto: SearchItemDto) {
    return this.taobaoService.directSearchItemTaobao(
      searchDto.text,
      searchDto.page,
    );
  }

  @Get('v1/:id')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'getTaobaoDetailItem',
    description: 'Get taobao item by id',
    summary: 'Get taobao item by id',
  })
  async getAddressByIdV1(@Param('id') id: string) {
    return this.taobaoService.directGetDetailItemV1(+id);
  }

  @Get('v2/:id')
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'getTaobaoDetailItem',
    description: 'Get taobao item by id',
    summary: 'Get taobao item by id',
  })
  async getAddressByIdV2(@Param('id') id: string) {
    return this.taobaoService.directGetDetailItemV2(id);
  }
}
