import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GameService } from './game.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, AgeGroup } from '../common/constants/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('AI 情景游戏')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('scenarios')
  @ApiOperation({ summary: '获取推荐游戏列表' })
  @ApiQuery({ name: 'ageGroup', enum: AgeGroup, required: false })
  @ApiQuery({ name: 'theme', required: false })
  async getScenarios(
    @Query('ageGroup') ageGroup?: AgeGroup,
    @Query('theme') theme?: string,
  ) {
    return this.gameService.getScenarios(ageGroup, theme);
  }

  @Get('scenarios/:id')
  @ApiOperation({ summary: '获取游戏场景详情' })
  async getScenarioDetail(@Param('id') id: string) {
    return this.gameService.getScenarioDetail(id);
  }

  @Post('sessions')
  @Roles(Role.CHILD)
  @ApiOperation({ summary: '开始游戏会话' })
  async startSession(
    @Body('scenarioId') scenarioId: string,
    @CurrentUser('id') studentId: string,
  ) {
    return this.gameService.startSession(scenarioId, studentId);
  }

  @Post('sessions/:id/choice')
  @Roles(Role.CHILD)
  @ApiOperation({ summary: '处理选择，返回反馈' })
  async processChoice(
    @Param('id') id: string,
    @Body('choiceId') choiceId: string,
  ) {
    return this.gameService.processChoice(id, choiceId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: '获取游戏会话详情' })
  async getSession(@Param('id') id: string) {
    return this.gameService.getSession(id);
  }

  @Get('history')
  @Roles(Role.CHILD, Role.PARENT)
  @ApiOperation({ summary: '获取学生的游戏历史' })
  async getHistory(@CurrentUser('id') userId: string) {
    return this.gameService.getStudentHistory(userId);
  }
}
