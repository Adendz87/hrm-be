import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaProducerService } from './KafkaProducerService';
import { UploadModule } from 'src/upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from 'src/contract/entities/contract.entity';
import { KafkaConsumerService } from './contract-upload.consumer';


@Module({
  imports: [
    UploadModule,
    TypeOrmModule.forFeature([Contract]),
  ],
  providers: [
    KafkaProducerService,
    KafkaConsumerService,
  ],
  exports: [
    KafkaProducerService,
  ],
})
export class KafkaModule { }