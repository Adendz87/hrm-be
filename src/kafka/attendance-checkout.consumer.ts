import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Kafka } from "kafkajs";
import { AttendanceLog } from "src/attendance/entities/attendanceLog.entity";
import { Repository } from "typeorm";

@Injectable()
export class AttendanceCheckOutConsumer
  implements OnModuleInit
{
  private readonly kafka = new Kafka({
    clientId: 'attendance-checkout-consumer',
    brokers: [
      'kafka-1:9092',
      'kafka-2:9092',
      'kafka-3:9092',
    ],
  });

  private readonly consumer =
    this.kafka.consumer({
      groupId: 'attendance-checkout-group',
    });

  constructor(
    @InjectRepository(AttendanceLog)
    private readonly attendanceLogRepository: Repository<AttendanceLog>,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: 'attendance.checkout',
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const payload = JSON.parse(
          message.value!.toString(),
        );

        await this.attendanceLogRepository.save({
          attendance_id: payload.attendanceId,
          action: payload.action,
          action_time: payload.actionTime,
          ip: payload.ip,
          user_agent: payload.userAgent,
        });
      },
    });
  }
}