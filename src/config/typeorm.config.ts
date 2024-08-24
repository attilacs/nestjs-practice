import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

const envFilePath = `env/${process.env.NODE_ENV}.env`;
config({ path: envFilePath });

if (!process.env.DATABASE) {
  throw new Error(
    `DATABASE environment variable is not set. Env file path: ${envFilePath}`,
  );
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.DATABASE,
  synchronize: process.env.SYNCHRONIZE === 'true',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  migrationsRun: process.env.SYNCHRONIZE !== 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
