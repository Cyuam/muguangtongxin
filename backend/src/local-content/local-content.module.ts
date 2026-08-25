import { Module } from '@nestjs/common';
import { LocalContentService } from './local-content.service';
import { LocalContentController } from './local-content.controller';

@Module({
  providers: [LocalContentService],
  controllers: [LocalContentController],
  exports: [LocalContentService],
})
export class LocalContentModule {}
