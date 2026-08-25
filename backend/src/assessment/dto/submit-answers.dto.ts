import { IsObject, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswersDto {
  @ApiProperty({ description: '作答记录（题目 ID -> 答案）', example: { q1: 'A', q2: 'B' } })
  @IsObject()
  answers: Record<string, string>;

  @ApiProperty({ description: '已作答时长（秒）', required: false })
  @IsOptional()
  @IsNumber()
  durationSec?: number;
}
