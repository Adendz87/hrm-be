import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [AuthModule, UsersModule, MinioModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService]
})
export class UploadModule { }
