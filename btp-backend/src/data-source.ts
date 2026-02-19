import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

if (!process.env.DB_HOST) {
  dotenv.config();
}

const requiredEnvVars = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
] as const;
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

const dbPort = parseInt(process.env.DB_PORT ?? '5432', 10);
if (Number.isNaN(dbPort)) {
  throw new Error(
    `DB_PORT must be a valid number, got: "${process.env.DB_PORT}"`,
  );
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: dbPort,
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [path.join(__dirname, '../priv/migrations/**/*{.js,.ts}')],
  migrationsRun: false,
  migrationsTransactionMode: 'all',
});
