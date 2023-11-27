import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { VariablesService } from './variables.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AddVariableDto,
  AdminIndexVariableDto,
  UpdateVariableDto,
} from './variables.dto';
import { CommonQueryRequest } from '../../shared/swagger.helper';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';
import { Pagination } from '../../decorators/pagination.decorator';
import { IPagination } from '../../adapters/pagination/pagination.interface';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';

@Controller('variables')
@ApiTags('variables')
@ApiBearerAuth('access-token')
export class VariablesController {
  constructor(private readonly variablesService: VariablesService) {}

  @Post()
  // @Roles(Role.Admin, Role.Root)
  @ApiOperation({
    operationId: 'AdminCreateNewVariable',
    description: 'Admin create new variable',
    summary: 'Admin create new variable',
  })
  adminCreateNewVariable(@Body() addVariableDto: AddVariableDto) {
    return this.variablesService.createNewVariable(addVariableDto);
  }

  @Get()
  @CommonQueryRequest()
  @UseInterceptors(PaginationInterceptor)
  @ApiOperation({
    operationId: 'indexVariables',
    description: 'Index variables',
    summary: 'Index variables',
  })
  adminIndexVariables(
    @Pagination() pagination: IPagination,
    @Query() adminIndexVariableDto: AdminIndexVariableDto,
  ) {
    return this.variablesService.indexVariable(
      adminIndexVariableDto,
      pagination,
    );
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Root)
  @ApiOperation({
    operationId: 'adminGetVariableById',
    description: 'Admin get variable by id',
    summary: 'Admin get variable by id',
  })
  adminGetVariableById(@Param('id') id: string) {
    return this.variablesService.getVariableById(id);
  }

  @Put(':id')
  // @Roles(Role.Admin, Role.Root)
  @ApiOperation({
    operationId: 'adminUpdateVariableById',
    description: 'Admin update variable by id',
    summary: 'Admin update variable by id',
  })
  adminUpdateVariableById(
    @Param('id') id: string,
    @Body() updateVariableDto: UpdateVariableDto,
  ) {
    return this.variablesService.updateVariableById(id, updateVariableDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Root)
  @ApiOperation({
    operationId: 'adminDeleteVariableById',
    description: 'Admin delete variable by id',
    summary: 'Admin delete variable by id',
  })
  adminDeleteVariableById(@Param('id') id: string) {
    return this.variablesService.deleteVariableById(id);
  }
}
