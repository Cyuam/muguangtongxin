import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';

@ApiTags('治理报告')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post('generate')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '生成治理报告' })
  async generateReport(
    @Body('jurisdiction') jurisdiction: string,
    @Body('period') period: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
  ) {
    return this.reportService.generateReport(
      jurisdiction,
      period as any,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get()
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '获取报告列表' })
  async getReports(
    @Query('jurisdiction') jurisdiction?: string,
    @Query('period') period?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.reportService.getReports(jurisdiction, period as any, page, pageSize);
  }

  @Get(':id')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '获取报告详情' })
  async getReport(@Param('id') id: string) {
    return this.reportService.getReport(id);
  }

  @Post(':id/export-pdf')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '导出 PDF' })
  async exportPdf(@Param('id') id: string) {
    return this.reportService.exportPdf(id);
  }

  @Post(':id/export-excel')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '导出 Excel' })
  async exportExcel(@Param('id') id: string) {
    return this.reportService.exportExcel(id);
  }

  @Post(':id/share')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '分享存档' })
  async shareReport(
    @Param('id') id: string,
    @Body('shareTo') shareTo: string[],
  ) {
    return this.reportService.shareReport(id, shareTo);
  }
}
