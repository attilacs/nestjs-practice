import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { SeedModule } from './modules/seed/seed.module';
import { AuthModule } from './modules/auth/auth.module';
import { ItemModule } from './modules/item/item.module';

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
    UserModule,
    SeedModule,
    AuthModule,
    ItemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
