import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';

@ApiTags('数据看板')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '总览' })
  async getOverview(@Query('jurisdiction') jurisdiction: string) {
    return this.dashboardService.getOverview(jurisdiction);
  }

  @Get('risk-map')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '风险地图' })
  async getRiskMap(@Query('jurisdiction') jurisdiction: string) {
    return this.dashboardService.getRiskMap(jurisdiction);
  }

  @Get('collab-status')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '协同状态' })
  async getCollabStatus(@Query('jurisdiction') jurisdiction: string) {
    return this.dashboardService.getCollabStatus(jurisdiction);
  }

  @Get('filter')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '多维筛选' })
  async filterData(
    @Query('jurisdiction') jurisdiction: string,
    @Query('classId') classId?: string,
    @Query('grade') grade?: number,
    @Query('riskLevel') riskLevel?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.filterData({
      jurisdiction,
      classId,
      grade,
      riskLevel,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
