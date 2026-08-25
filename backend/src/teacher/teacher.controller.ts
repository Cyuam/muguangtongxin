import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TeacherService } from './teacher.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('教师端')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('teacher')
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  @Get('diagnosis/class/:classId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '班级诊断' })
  async getDiagnosisClass(
    @Param('classId') classId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teacherService.getDiagnosisClass(userId, classId);
  }

  @Get('diagnosis/student/:studentId')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '学生诊断' })
  async getDiagnosisStudent(
    @Param('studentId') studentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.teacherService.getDiagnosisStudent(userId, studentId);
  }

  @Get('diagnosis/trends')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '诊断趋势' })
  async getDiagnosisTrends(
    @Query('classId') classId: string,
    @Query('months') months: number,
    @CurrentUser('id') userId: string,
  ) {
    return this.teacherService.getDiagnosisTrends(userId, classId, months);
  }

  @Get('advices')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '获取教学建议列表' })
  async getAdvices(@CurrentUser('id') userId: string) {
    return this.teacherService.getAdvices(userId);
  }

  @Post('advices/:id/feedback')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '教学建议反馈' })
  async feedbackAdvice(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('feedback') feedback: string,
  ) {
    return this.teacherService.feedbackAdvice(id, userId, feedback);
  }

  @Get('classes')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: '获取教师的班级列表' })
  async getClasses(@CurrentUser('id') userId: string) {
    return this.teacherService.getClasses(userId);
  }
}
