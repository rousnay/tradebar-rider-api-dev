import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RidersModule } from './modules/riders/riders.module';
import configPayment from './config/payment.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configPayment],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      // port: 3306,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      // logging: ['query', 'error', 'schema', 'warn', 'info', 'log', 'migration'],
      synchronize: true,
      ssl: false,
      // ssl: {
      //   rejectUnauthorized: true,
      // },
    }),
    AuthModule,
    RidersModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
