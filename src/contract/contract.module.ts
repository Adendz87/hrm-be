import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './entities/contract.entity';
import { UsersModule } from 'src/users/users.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { UploadModule } from 'src/upload/upload.module';


@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Contract]), KafkaModule, UploadModule],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule { }
