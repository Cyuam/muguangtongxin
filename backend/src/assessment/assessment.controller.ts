import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, AgeGroup } from '../common/constants/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('测评')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('assessment')
export class AssessmentController {
  constructor(private assessmentService: AssessmentService) {}

  @Get('scales')
  @ApiOperation({ summary: '获取量表列表（按年龄段筛选）' })
  @ApiQuery({ name: 'ageGroup', enum: AgeGroup, required: false })
  @ApiQuery({ name: 'category', required: false })
  async getScales(
    @Query('ageGroup') ageGroup?: AgeGroup,
    @Query('category') category?: string,
  ) {
    return this.assessmentService.getScales(ageGroup, category);
  }

  @Get('scales/:id')
  @ApiOperation({ summary: '获取量表详情' })
  async getScaleDetail(@Param('id') id: string) {
    return this.assessmentService.getScaleDetail(id);
  }

  @Post('sessions')
  @Roles(Role.CHILD, Role.PARENT, Role.TEACHER)
  @ApiOperation({ summary: '创建测评会话（支持断点续测）' })
  async createSession(@Body() dto: CreateSessionDto) {
    return this.assessmentService.createSession(dto);
  }

  @Patch('sessions/:id')
  @Roles(Role.CHILD, Role.PARENT, Role.TEACHER)
  @ApiOperation({ summary: '提交作答（支持断点续测，部分提交保存进度）' })
  async submitAnswers(
    @Param('id') id: string,
    @Body() dto: SubmitAnswersDto,
  ) {
    return this.assessmentService.submitAnswers(id, dto);
  }

  @Post('sessions/:id/complete')
  @Roles(Role.CHILD, Role.PARENT, Role.TEACHER)
  @ApiOperation({ summary: '完成测评，触发评分' })
  async completeSession(@Param('id') id: string) {
    return this.assessmentService.completeSession(id);
  }

  @Get('results/history')
  @Roles(Role.CHILD, Role.PARENT, Role.TEACHER)
  @ApiOperation({ summary: '获取测评结果历史' })
  async getResultsHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.assessmentService.getResultsHistory(userId, page, pageSize);
  }

  @Get('results/:id')
  @ApiOperation({ summary: '获取单个测评结果' })
  async getResult(@Param('id') id: string) {
    return this.assessmentService.getResult(id);
  }
}
