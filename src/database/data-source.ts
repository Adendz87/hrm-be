import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { entities } from './entities';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'hrmn',
  synchronize: true,
  logging: ['query'],
  entities: entities,
  migrations: ['src/database/migrations/*.ts'],
});