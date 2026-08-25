import { Module } from '@nestjs/common';
import { InterventionService } from './intervention.service';
import { InterventionController } from './intervention.controller';

@Module({
  providers: [InterventionService],
  controllers: [InterventionController],
  exports: [InterventionService],
})
export class InterventionModule {}
