import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GameEngine } from './game.engine';

@Module({
  providers: [AiService, GameEngine],
  exports: [AiService, GameEngine],
})
export class AiModule {}
