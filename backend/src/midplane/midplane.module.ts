import { Module } from '@nestjs/common';
import { MidplaneService } from './midplane.service';
import { MidplaneController } from './midplane.controller';

@Module({
  providers: [MidplaneService],
  controllers: [MidplaneController],
  exports: [MidplaneService],
})
export class MidplaneModule {}
