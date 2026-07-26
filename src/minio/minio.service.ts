import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  readonly client: Client;

  constructor() {
    this.client = new Client({
      endPoint: 'minio',
      port: 9000,
      useSSL: false,
      accessKey: 'admin',
      secretKey: '12345678',
    });
  }
}