import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuditInterceptor } from './audit/audit.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // 全局前缀
  app.setGlobalPrefix('api/v1');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 审计日志拦截器
  app.useGlobalInterceptors(app.get(AuditInterceptor));

  // Swagger API 文档
  const config = new DocumentBuilder()
    .setTitle('沐光童心 · 多端协同系统 API')
    .setDescription('测评-诊断-干预-追踪闭环 + 家校社协同治理数据中台')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`🚀 沐光童心后端服务已启动: http://localhost:${port}`, 'Bootstrap');
  Logger.log(`📚 API 文档: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
