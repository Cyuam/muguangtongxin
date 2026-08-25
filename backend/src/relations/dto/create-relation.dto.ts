import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRelationDto {
  @ApiProperty({ description: '主体用户 ID（如家长）' })
  @IsString()
  fromUserId: string;

  @ApiProperty({ description: '客体用户 ID（如儿童）' })
  @IsString()
  toUserId: string;

  @ApiProperty({ description: '关系类型', example: 'PARENT_OF', enum: ['PARENT_OF', 'TEACHER_OF', 'GUARDIAN_OF'] })
  @IsIn(['PARENT_OF', 'TEACHER_OF', 'GUARDIAN_OF'])
  relationType: string;
}
