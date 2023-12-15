import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../decorators/authorization.decorator';
import { Role } from '../../shared/constant';
import { User, UserDataJwtProperties } from '../../decorators/user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@ApiTags('dashboard')
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(Role.Client)
  @ApiOperation({
    operationId: 'getDashboardInformation',
    description: 'Get dashboard information',
    summary: 'Get dashboard information',
  })
  clientGetDashboard(@User(UserDataJwtProperties.USERID) userId: string) {
    return this.dashboardService.getDashboardInformation(userId);
  }

  @Get()
  @Roles(Role.Admin)
  @ApiOperation({
    operationId: 'getAdminDashboardInformation',
    description: 'Get admin dashboard information',
    summary: 'Get admin dashboard information',
  })
  adminGetDashboard() {
    return this.dashboardService.getAdminDashboardInformation();
  }
}
