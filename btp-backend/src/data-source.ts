import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

if (!process.env.DB_HOST) {
  dotenv.config();
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [path.join(__dirname, '../priv/migrations/**/*{.js,.ts}')],
  migrationsRun: false,
  migrationsTransactionMode: 'all',
});
