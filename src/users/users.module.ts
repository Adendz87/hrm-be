import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { RedisModule } from 'src/redis/redis.module';


@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule, RedisModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule]
})
export class UsersModule { }
