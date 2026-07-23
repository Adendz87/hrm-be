import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedAdmin } from './database/seed-admin';
import { TimeoutInterceptor } from './commons/interceptors/timeout.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new TimeoutInterceptor());


  // app.enableCors({
  //   origin: ["http://localhost:3000"],
  //   credentials: true, // Cho phép gửi cookies/token
  //   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
  // });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Đây là tài liệu API của ứng dụng')
    .setVersion('1.0')
    .addBearerAuth()
    .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.useStaticAssets(join(process.cwd(), 'storage'), {
    prefix: '/storage/',
  });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // exceptionFactory: (errors) => {
      //   console.log('VALIDATION ERRORS:', errors);
      //   throw new BadRequestException(errors);
      // },
    }),
  );


  //thêm user admin mỗi khi start app
  const dataSource = app.get(DataSource);
  await seedAdmin(dataSource);

  const port = process.env.PORT ?? 8000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server is running on http://0.0.0.0:${port}`);
}
bootstrap();