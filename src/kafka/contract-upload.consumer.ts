import {
    Injectable,
    OnModuleInit,
    Logger,
} from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { UploadService } from 'src/upload/upload.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from 'src/contract/entities/contract.entity';


@Injectable()
export class KafkaConsumerService
    implements OnModuleInit {

    private readonly logger =
        new Logger(KafkaConsumerService.name);


    private readonly kafka =
        new Kafka({
            clientId: 'hrm-consumer',
            brokers: [
                'kafka-1:9092',
                'kafka-2:9092',
                'kafka-3:9092',
            ],
        });


    private readonly consumer =
        this.kafka.consumer({
            groupId: 'hrm-group',
        });



    constructor(
        private readonly uploadService: UploadService,

        @InjectRepository(Contract)
        private readonly contractRepository:
            Repository<Contract>,
    ) { }



    async onModuleInit() {

        await this.consumer.connect();

        this.logger.log(
            'Kafka consumer connected',
        );


        await this.consumer.subscribe({
            topic: 'contract.upload',
            fromBeginning: false,
        });


        this.logger.log(
            'Subscribed contract.upload',
        );


        await this.consumer.run({

            eachMessage: async ({ message }) => {

                try {

                    const payload =
                        JSON.parse(
                            message.value!.toString(),
                        );

                    this.logger.log(
                        `RECEIVED ${payload.contractId}`,
                    );

                    const objectName =
                        await this.uploadService.uploadToStorage(
                            payload.tempPath,
                        );

                    await this.contractRepository.update(
                        payload.contractId,
                        {
                            file_url: objectName,
                        },
                    );

                    await this.uploadService.deleteTemp(
                        payload.tempPath,
                    );

                    this.logger.log(
                        `UPLOAD DONE ${objectName}`,
                    );


                } catch (error) {

                    this.logger.error(error);

                }

            },

        });

    }

}