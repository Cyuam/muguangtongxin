import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PointsService } from './points.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('积分激励')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('points')
export class PointsController {
  constructor(private pointsService: PointsService) {}

  @Get('balance')
  @ApiOperation({ summary: '获取积分余额' })
  async getBalance(@CurrentUser('id') userId: string) {
    const balance = await this.pointsService.getBalance(userId);
    return { balance };
  }

  @Get('ledger')
  @ApiOperation({ summary: '获取积分流水记录' })
  async getLedger(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.pointsService.getLedger(userId, page, pageSize);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: '获取积分排行榜' })
  async getLeaderboard(@Query('topN') topN?: number) {
    return this.pointsService.getLeaderboard(topN);
  }

  @Get('rank')
  @ApiOperation({ summary: '获取当前用户排名' })
  async getUserRank(@CurrentUser('id') userId: string) {
    return this.pointsService.getUserRank(userId);
  }

  @Post('redeem')
  @Roles(Role.CHILD, Role.PARENT)
  @ApiOperation({ summary: '积分兑换' })
  async redeem(
    @CurrentUser('id') userId: string,
    @Body('itemCode') itemCode: string,
    @Body('cost') cost: number,
  ) {
    return this.pointsService.redeem(userId, itemCode, cost);
  }

  @Get('achievements')
  @ApiOperation({ summary: '获取成就徽章列表' })
  async getAchievements(@CurrentUser('id') userId: string) {
    return this.pointsService.getAchievements(userId);
  }
}
