import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';

@ApiTags('追踪')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Post()
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '启动追踪' })
  async startTracking(
    @Body('interventionId') interventionId: string,
    @Body('studentId') studentId: string,
    @Body('baselineResultId') baselineResultId: string,
  ) {
    return this.trackingService.startTracking(interventionId, studentId, baselineResultId);
  }

  @Post(':id/evaluate')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '效果评估' })
  async evaluateEffectiveness(
    @Param('id') id: string,
    @Body('followupResultId') followupResultId: string,
  ) {
    return this.trackingService.evaluateEffectiveness(id, followupResultId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取追踪轨迹' })
  async getTrajectory(@Param('id') id: string) {
    return this.trackingService.getTrajectory(id);
  }

  @Get('student/:studentId')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '获取学生的所有追踪记录' })
  async getStudentTrackings(@Param('studentId') studentId: string) {
    return this.trackingService.getStudentTrackings(studentId);
  }

  @Post(':id/escalate')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '升级干预（效果不佳时）' })
  async escalate(@Param('id') id: string) {
    return this.trackingService.escalateIntervention(id);
  }

  @Patch(':id/close')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '关闭追踪' })
  async close(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.trackingService.closeTracking(id, reason);
  }
}
