import { Module } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { ScoringEngine } from './scoring.engine';

@Module({
  providers: [AssessmentService, ScoringEngine],
  controllers: [AssessmentController],
  exports: [AssessmentService, ScoringEngine],
})
export class AssessmentModule {}
