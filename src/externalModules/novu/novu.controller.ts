import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';
import { NovuService } from './novu.service';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { createTimeStringWithFormat } from '../../shared/helpers';

@Controller('noti')
@ApiTags('Notification')
@ApiBearerAuth('access-token')
export class NovuController {
  constructor(private readonly novuService: NovuService) {}

  @Post()
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'testNotification',
    description: 'Test notification',
    summary: 'Test notification',
  })
  clientIndexAddress(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.novuService.testNotification(userId, {
      date: createTimeStringWithFormat(new Date(), 'HH:mm:ss DD-MM-YYYY'),
    });
  }
}
