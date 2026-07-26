import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MySqlModule } from './database/mysql.module';
import { UsersModule } from './users/users.module';
import { DepartmentModule } from './department/department.module';
import { PositionModule } from './position/position.module';
import { RedisModule } from './redis/redis.module';
import { RoleModule } from './role/role.module';
import { UploadModule } from './upload/upload.module';
import { ContractModule } from './contract/contract.module';
import { KafkaModule } from './kafka/kafka.module';
import { MinioModule } from './minio/minio.module';


@Module({
  imports: [
    AuthModule,
    MySqlModule,
    UsersModule,
    UploadModule,
    DepartmentModule,
    PositionModule,
    RedisModule,
    RoleModule,
    ContractModule,
    KafkaModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }