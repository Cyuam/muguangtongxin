import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InterventionService } from './intervention.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('干预')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('intervention')
export class InterventionController {
  constructor(private interventionService: InterventionService) {}

  @Post('warning')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '触发预警' })
  async triggerWarning(
    @Body('resultId') resultId: string,
    @Body('studentId') studentId: string,
    @Body('parentId') parentId: string,
  ) {
    return this.interventionService.triggerWarning(resultId, studentId, parentId);
  }

  @Post('care-advice')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '推送监护建议' })
  async pushCareAdvice(
    @Body('parentId') parentId: string,
    @Body('studentId') studentId: string,
    @Body('topic') topic: string,
    @Body('content') content: any,
  ) {
    return this.interventionService.pushCareAdvice(parentId, studentId, topic, content);
  }

  @Post('teaching-advice')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '生成教学建议' })
  async generateTeachingAdvice(
    @Body('diagnosisId') diagnosisId: string,
    @Body('teacherId') teacherId: string,
    @Body('content') content: any,
  ) {
    return this.interventionService.generateTeachingAdvice(diagnosisId, teacherId, content);
  }

  @Post('parent-task')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '生成亲子任务' })
  async generateParentTask(
    @Body('parentId') parentId: string,
    @Body('studentId') studentId: string,
    @Body() task: any,
  ) {
    return this.interventionService.generateParentTask(parentId, studentId, task);
  }

  @Patch(':id/escalate')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '升级干预' })
  async escalate(@Param('id') id: string) {
    return this.interventionService.escalateIntervention(id);
  }

  @Patch(':id/acted')
  @ApiOperation({ summary: '标记干预已处理' })
  async markActed(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.interventionService.markInterventionActed(id, status);
  }

  @Get()
  @ApiOperation({ summary: '获取干预列表' })
  async getInterventions(
    @CurrentUser('id') userId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.interventionService.getInterventions(userId, type, status);
  }
}
