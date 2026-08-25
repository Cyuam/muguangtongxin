import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MidplaneService } from './midplane.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('数据中台')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('midplane')
export class MidplaneController {
  constructor(private midplaneService: MidplaneService) {}

  @Get('aggregate/:studentId')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '数据汇聚' })
  async aggregateData(@Param('studentId') studentId: string) {
    return this.midplaneService.aggregateData(studentId);
  }

  @Post('query')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '跨端数据查询' })
  async crossEndQuery(@Body() params: any) {
    return this.midplaneService.crossEndQuery(params);
  }

  @Post('collab-tasks')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '创建协同任务' })
  async createCollabTask(
    @CurrentUser('id') initiatorId: string,
    @Body('type') type: string,
    @Body('targetIds') targetIds: string[],
    @Body('content') content: any,
  ) {
    return this.midplaneService.createCollabTask(initiatorId, type as any, targetIds, content);
  }

  @Post('collab-tasks/:id/process')
  @ApiOperation({ summary: '处理协同任务' })
  async processCollabTask(
    @Param('id') id: string,
    @CurrentUser('id') handlerId: string,
    @Body('result') result: any,
  ) {
    return this.midplaneService.processCollabTask(id, handlerId, result);
  }

  @Get('collab-tasks')
  @ApiOperation({ summary: '获取协同任务列表' })
  async getCollabTasks(
    @Query('status') status?: string,
    @Query('initiatorId') initiatorId?: string,
  ) {
    return this.midplaneService.getCollabTasks(status, initiatorId);
  }
}
