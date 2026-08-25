import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DiagnosisService } from './diagnosis.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/constants/enums';

@ApiTags('诊断')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('diagnosis')
export class DiagnosisController {
  constructor(private diagnosisService: DiagnosisService) {}

  @Post('individual/:resultId')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '个体诊断' })
  async diagnoseIndividual(@Param('resultId') resultId: string) {
    return this.diagnosisService.diagnoseIndividual(resultId);
  }

  @Get('class/:classId')
  @Roles(Role.TEACHER, Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '班级诊断' })
  async diagnoseClass(@Param('classId') classId: string) {
    return this.diagnosisService.diagnoseClass(classId);
  }

  @Get('district/:jurisdiction')
  @Roles(Role.COMMUNITY_ADMIN, Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: '辖区诊断' })
  async diagnoseDistrict(@Param('jurisdiction') jurisdiction: string) {
    return this.diagnosisService.diagnoseDistrict(jurisdiction);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取诊断详情' })
  async getDiagnosis(@Param('id') id: string) {
    return this.diagnosisService.getDiagnosis(id);
  }
}
