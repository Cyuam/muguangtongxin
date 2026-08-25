import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({ description: '量表 ID' })
  @IsUUID()
  scaleId: string;

  @ApiProperty({ description: '学生 ID' })
  @IsUUID()
  studentId: string;
}
