import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from './config/config.module';
import { MysqlModule } from './database/mysql.module';
import { MongoModule } from './database/mongo.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { RidersModule } from './modules/riders/riders.module';
import { LocationModule } from './modules/location/location.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule,
    MysqlModule,
    MongoModule,
    AuthModule,
    RidersModule,
    LocationModule,
    ChatModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
