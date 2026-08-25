import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';
import { RelationsService } from './relations.service';
import { CreateRelationDto } from './dto/create-relation.dto';

@ApiTags('关系绑定')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('relations')
export class RelationsController {
  constructor(private relationsService: RelationsService) {}

  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @Post()
  @ApiOperation({ summary: '创建关系绑定（教师/管理员）' })
  async create(@Body() dto: CreateRelationDto) {
    return this.relationsService.createRelation(dto);
  }

  @Get()
  @ApiOperation({ summary: '查询当前用户的关系' })
  async getRelations(@Param('userId') userId: string) {
    return this.relationsService.getRelations(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: '解绑关系' })
  async delete(@Param('id') id: string) {
    return this.relationsService.deleteRelation(id);
  }
}
