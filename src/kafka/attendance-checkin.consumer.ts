import {
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceLog } from 'src/attendance/entities/attendanceLog.entity';

@Injectable()
export class AttendanceCheckInConsumer
    implements OnModuleInit {
    private readonly logger = new Logger(
        AttendanceCheckInConsumer.name,
    );

    private readonly kafka = new Kafka({
        clientId: 'attendance-checkin-consumer',
        brokers: [
            'kafka-1:9092',
            'kafka-2:9092',
            'kafka-3:9092',
        ],
    });

    private readonly consumer =
        this.kafka.consumer({
            groupId: 'attendance-checkin-group',
        });

    constructor(
        @InjectRepository(AttendanceLog)
        private readonly attendanceLogRepository: Repository<AttendanceLog>,
    ) { }

    async onModuleInit() {
        await this.consumer.connect();

        await this.consumer.subscribe({
            topic: 'attendance.checkin',
        });

        this.logger.log(
            'Subscribed attendance.checkin',
        );

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                const payload = JSON.parse(
                    message.value!.toString(),
                );

                this.logger.log(
                    `CHECK IN ${payload.attendanceId}`,
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