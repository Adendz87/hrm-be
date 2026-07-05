import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MySqlModule } from './database/mysql.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';
import { DepartmentModule } from './department/department.module';
import { PositionModule } from './position/position.module';


@Module({
  imports: [
    AuthModule,
    MySqlModule,
    UsersModule,
    UploadModule,
    DepartmentModule,
    PositionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }