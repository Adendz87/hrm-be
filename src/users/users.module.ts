import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';


@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [UsersService],
  controllers:[UsersController],
  exports: [UsersService, TypeOrmModule]
})
export class UsersModule {}
