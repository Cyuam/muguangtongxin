import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RelationsModule } from './relations/relations.module';
import { AssessmentModule } from './assessment/assessment.module';
import { GameModule } from './game/game.module';
import { PointsModule } from './points/points.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { InterventionModule } from './intervention/intervention.module';
import { TrackingModule } from './tracking/tracking.module';
import { MidplaneModule } from './midplane/midplane.module';
import { AiModule } from './ai/ai.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';
import { ParentModule } from './parent/parent.module';
import { TeacherModule } from './teacher/teacher.module';
import { AdminModule } from './admin/admin.module';
import { LocalContentModule } from './local-content/local-content.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    RelationsModule,
    AssessmentModule,
    GameModule,
    PointsModule,
    DiagnosisModule,
    InterventionModule,
    TrackingModule,
    MidplaneModule,
    AiModule,
    NotificationModule,
    ReportModule,
    DashboardModule,
    AuditModule,
    ParentModule,
    TeacherModule,
    AdminModule,
    LocalContentModule,
  ],
})
export class AppModule {}
