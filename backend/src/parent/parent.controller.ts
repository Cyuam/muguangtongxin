import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ParentService } from './parent.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('家长端')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('parent')
export class ParentController {
  constructor(private parentService: ParentService) {}

  @Get('warnings')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '获取预警列表' })
  async getWarnings(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.parentService.getWarnings(userId, status);
  }

  @Get('warnings/:id')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '获取预警详情' })
  async getWarning(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.parentService.getWarning(id, userId);
  }

  @Get('care-advices')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '获取监护建议列表' })
  async getCareAdvices(@CurrentUser('id') userId: string) {
    return this.parentService.getCareAdvices(userId);
  }

  @Post('care-advices/:id/feedback')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '监护建议反馈' })
  async feedbackCareAdvice(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('feedback') feedback: string,
  ) {
    return this.parentService.feedbackCareAdvice(id, userId, feedback);
  }

  @Get('tasks')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '获取亲子任务列表' })
  async getTasks(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
  ) {
    return this.parentService.getTasks(userId, status);
  }

  @Post('tasks')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '创建亲子任务' })
  async createTask(
    @CurrentUser('id') userId: string,
    @Body() task: any,
  ) {
    return this.parentService.createTask(userId, task);
  }

  @Patch('tasks/:id/verify')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '验证亲子任务完成' })
  async verifyTask(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.parentService.verifyTask(id, userId);
  }

  @Get('children')
  @Roles(Role.PARENT)
  @ApiOperation({ summary: '获取关联儿童列表' })
  async getChildren(@CurrentUser('id') userId: string) {
    return this.parentService.getChildren(userId);
  }
}
