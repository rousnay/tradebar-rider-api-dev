import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { ConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RidersModule } from './modules/riders/riders.module';
import { MysqlModule } from './database/mysql.module';
import { MongoModule } from './database/mongo.module';

@Module({
  imports: [ConfigModule, MysqlModule, MongoModule, AuthModule, RidersModule],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
