import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocalContentService } from './local-content.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, AgeGroup } from '../common/constants/enums';

@ApiTags('本地化内容')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('local-content')
export class LocalContentController {
  constructor(private localContentService: LocalContentService) {}

  @Get()
  @ApiOperation({ summary: '获取本地化内容' })
  @ApiQuery({ name: 'jurisdiction', required: true })
  @ApiQuery({ name: 'topic', required: false })
  @ApiQuery({ name: 'ageGroup', enum: AgeGroup, required: false })
  @ApiQuery({ name: 'contentType', required: false })
  async getContent(
    @Query('jurisdiction') jurisdiction: string,
    @Query('topic') topic?: string,
    @Query('ageGroup') ageGroup?: AgeGroup,
    @Query('contentType') contentType?: string,
  ) {
    return this.localContentService.getContent({ jurisdiction, topic, ageGroup, contentType });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单条本地化内容' })
  async getContentById(@Param('id') id: string) {
    return this.localContentService.getContentById(id);
  }

  @Post()
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '创建本地化内容' })
  async createContent(@Body() params: any) {
    return this.localContentService.createContent(params);
  }

  @Patch(':id')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '更新内容' })
  async updateContent(
    @Param('id') id: string,
    @Body('content') content: any,
  ) {
    return this.localContentService.updateContent(id, content);
  }

  @Delete(':id')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '删除本地化内容' })
  async deleteContent(@Param('id') id: string) {
    return this.localContentService.deleteContent(id);
  }

  @Post('seed/beijiao')
  @Roles(Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '初始化北滘镇种子数据' })
  async seedBeijiao() {
    return this.localContentService.seedBeijiaoData();
  }

  @Get('seed/beijiao/preview')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '预览北滘镇种子数据' })
  async previewBeijiao() {
    return this.localContentService.getBeijaoSeedData();
  }
}
