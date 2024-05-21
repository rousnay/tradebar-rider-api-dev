import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configSwagger } from './config/swagger.config';
import * as Sentry from '@sentry/node';
import { SentryFilter } from './core/filters/sentry.filter';
// import { HttpExceptionFilter } from './http-exception.filter.ts';
import { ValidationPipe } from '@nestjs/common';
import { CustomValidationPipe } from './core/pipes/custom-validation.pipe';
import { LoggerFactory } from './config/winston.config';
// import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  // const app = await NestFactory.create(AppModule);
  // const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    // logger: LoggerFactory('MyApp'),
  });

  // app.enableCors();
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',

    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  configSwagger(app);

  // Enable validation globally
  // app.useGlobalPipes(new ValidationPipe());
  // Use the custom validation pipe globally
  app.useGlobalPipes(new CustomValidationPipe());

  // Initialize Sentry by passing the DNS included in the .env
  if (process.env.NODE_ENV === 'staging') {
    Sentry.init({
      dsn: process.env.SENTRY_DNS,
    });
  }

  // Import the filter globally, capturing all exceptions on all routes
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));
  await app.listen(port);
}
bootstrap();
// export { bootstrap };
// export default bootstrap;
