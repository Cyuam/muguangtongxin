import { Module } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisController } from './diagnosis.controller';

@Module({
  providers: [DiagnosisService],
  controllers: [DiagnosisController],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
