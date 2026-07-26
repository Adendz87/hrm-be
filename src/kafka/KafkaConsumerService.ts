import {
    Injectable,
    OnModuleInit,
    OnModuleDestroy,
    Logger,
} from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { UploadService } from 'src/upload/upload.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from 'src/contract/entities/contract.entity';

@Injectable()
export class KafkaConsumerService
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(
        KafkaConsumerService.name,
    );

    private readonly kafka = new Kafka({
        clientId: 'hrm-consumer',
        brokers: [
            'kafka-1:9092',
            'kafka-2:9092',
            'kafka-3:9092',
        ]
    });

    private readonly consumer =
        this.kafka.consumer({
            groupId: 'hrm-group',
        });

    constructor(
        private readonly uploadService: UploadService,

        @InjectRepository(Contract)
        private readonly contractRepository: Repository<Contract>,
    ) { }

    async onModuleInit() {
        await this.consumer.connect();

        await this.consumer.subscribe({
            topic: 'contract.upload',
            fromBeginning: false,
        });

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    const payload = JSON.parse(
                        message.value!.toString(),
                    );

                    this.logger.log(
                        `Upload contract ${payload.contractId}`,
                    );

                    const objectName =
                        await this.uploadService.uploadToStorage(
                            payload.tempPath,
                        );

                    this.logger.log(
                        `MINIO URL: ${objectName}`,
                    );


                    const result = await this.contractRepository.update(
                        payload.contractId,
                        {
                            file_url: objectName,
                        },
                    );

                    this.logger.log(
                        `UPDATE RESULT: ${JSON.stringify(result)}`,
                    );

                    await this.uploadService.deleteTemp(
                        payload.tempPath,
                    );

                    this.logger.log(
                        `Upload success ${payload.contractId}`,
                    );
                } catch (err) {

                    this.logger.error(err);

                    throw err;

                }
            },
        });
    }

    async onModuleDestroy() {
        await this.consumer.disconnect();
    }
}