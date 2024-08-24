import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `env/${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE,
      synchronize: process.env.SYNCHRONIZE === 'true',
      autoLoadEntities: true,
      migrations: ['dist/migrations/*.js'],
      migrationsRun: process.env.SYNCHRONIZE !== 'true',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
