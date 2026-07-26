import {
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaProducerService
  implements OnModuleInit {
  private readonly kafka = new Kafka({
    clientId: 'hrm-producer',
    brokers: [
      'kafka-1:9092',
      'kafka-2:9092',
      'kafka-3:9092',
    ],
  });

  private readonly producer =
    this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async emit(
    topic: string,
    payload: any,
  ) {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}