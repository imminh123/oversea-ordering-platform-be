import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../decorators/authorization.decorator';
import { Role, WebAdminRole } from '../../shared/constant';
import { SearchByImage, SearchItemDtoV3, UploadFileDto } from './tabao.dto';
import { TaobaoService } from './taobao.service';
import { PaginationInterceptor } from '../../interceptors/pagination.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import type { Response } from 'express';
import { FileValidationPipe } from '../../shared/file.helper';

@Controller('taobao')
@ApiTags('Taobao')
@ApiBearerAuth('access-token')
export class TaobaoController {
  constructor(private readonly taobaoService: TaobaoService) {}

  @Get()
  @UseInterceptors(PaginationInterceptor)
  @Roles(Role.Client, ...WebAdminRole)
  @ApiOperation({
    operationId: 'searchTaobaoItem',
    description: 'Search taobao item',
    summary: 'Search taobao item',
  })
  clientIndexAddress(@Query() searchDto: SearchItemDtoV3) {
    return this.taobaoService.directSearchItemTaobaoV3(searchDto);
  }

  @Get('image/:type/:fileName')
  @ApiOperation({
    operationId: 'getImage',
    description: 'Get image',
    summary: 'Get image',
  })
  async getImageFromLocalStorage(
    @Res({ passthrough: true }) res: Response,
    @Param('fileName') fileName: string,
    @Param('type') type: string,
  ): Promise<StreamableFile> {
    const response = await this.taobaoService.getImage(fileName, type);
    res.set({
      'Content-Type': `image/${type}`,
      'Content-Disposition': `inline`,
    });
    return response;
  }

  @Get('v1/:id')
  @Roles(Role.Client, ...WebAdminRole)
  @ApiOperation({
    operationId: 'getTaobaoDetailItem',
    description: 'Get taobao item by id',
    summary: 'Get taobao item by id',
  })
  async getAddressByIdV1(@Param('id') id: string) {
    return this.taobaoService.directGetDetailItemV3(+id);
  }

  // @Get('v2/:id')
  // @Roles(Role.Client, ...WebAdminRole)
  // @ApiOperation({
  //   operationId: 'getTaobaoDetailItemV2',
  //   description: 'Get taobao item by id v2',
  //   summary: 'Get taobao item by id v2',
  // })
  // async getAddressByIdV2(@Param('id') id: string) {
  //   return this.taobaoService.directGetDetailItemV2(id);
  // }

  @Roles(Role.Client, ...WebAdminRole)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    operationId: 'searchItemByImage',
    description: 'Search Item By Image',
    summary: 'Search Item By Image',
  })
  @ApiBody({
    description: 'File upload',
    type: UploadFileDto,
  })
  @Post('image')
  create(
    @UploadedFile(new FileValidationPipe())
    imageChangeDto: Express.Multer.File,
    @User(UserDataJwtProperties.USERID) userId: string,
    @Query() searchDto: SearchByImage,
  ) {
    return this.taobaoService.searchItemByImage(
      userId,
      imageChangeDto,
      searchDto,
    );
  }
}
