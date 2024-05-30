import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { ConfigModule } from './config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { RidersModule } from './modules/riders/riders.module';
import { MysqlModule } from './database/mysql.module';
import { MongoModule } from './database/mongo.module';
import { ChatGateway } from './websocket/chat.gateway';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ChatController } from './websocket/chat.controller';
import { LocationModule } from './location/location.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    MysqlModule,
    MongoModule,
    AuthModule,
    RidersModule,
    LocationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  providers: [AppService, ChatGateway],
  controllers: [AppController, ChatController],
})
export class AppModule {}
