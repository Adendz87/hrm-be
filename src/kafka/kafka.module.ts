import { Module } from '@nestjs/common';
import { KafkaProducerService } from './KafkaProducerService';
import { UploadModule } from 'src/upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from 'src/contract/entities/contract.entity';
import { KafkaConsumerService } from './contract-upload.consumer';
import { AttendanceLog } from 'src/attendance/entities/attendanceLog.entity';
import { AttendanceCheckInConsumer } from './attendance-checkin.consumer';
import { AttendanceCheckOutConsumer } from './attendance-checkout.consumer';


@Module({
  imports: [
    UploadModule,
    TypeOrmModule.forFeature([Contract, AttendanceLog]),
  ],
  providers: [
    KafkaProducerService,
    KafkaConsumerService,
    AttendanceCheckInConsumer,
    AttendanceCheckOutConsumer,
  ],
  exports: [
    KafkaProducerService,
  ],
})
export class KafkaModule { }