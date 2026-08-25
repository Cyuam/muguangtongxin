import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';

@ApiTags('社区后台')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard/overview')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '总览' })
  async getDashboardOverview(@Query('jurisdiction') jurisdiction: string) {
    return this.adminService.getDashboardOverview(jurisdiction);
  }

  @Get('dashboard/risk-map')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '风险地图' })
  async getDashboardRiskMap(@Query('jurisdiction') jurisdiction: string) {
    return this.adminService.getDashboardRiskMap(jurisdiction);
  }

  @Get('dashboard/collab-status')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '协同状态' })
  async getDashboardCollabStatus(@Query('jurisdiction') jurisdiction: string) {
    return this.adminService.getDashboardCollabStatus(jurisdiction);
  }

  @Post('reports/generate')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '生成报告' })
  async generateReport(
    @Body('jurisdiction') jurisdiction: string,
    @Body('period') period: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.adminService.generateReport(jurisdiction, period, startDate, endDate);
  }

  @Get('reports')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '获取报告列表' })
  async getReports(
    @Query('jurisdiction') jurisdiction?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.adminService.getReports(jurisdiction, page, pageSize);
  }

  @Get('reports/:id/download')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '下载报告' })
  async downloadReport(@Param('id') id: string) {
    return this.adminService.downloadReport(id);
  }
}
