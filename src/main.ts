// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import * as httpContext from 'express-http-context';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeSwagger } from './shared/swagger.helper';
import * as config from 'config';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { getHost } from './shared/config/config.provider';
import { createLightship } from 'lightship';
import * as responseTime from 'response-time';
import * as express from 'express';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { v4 as uuidV4 } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { exposedHeaders: '*', allowedHeaders: '*' },
  });
  app.use(httpContext.middleware);
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(responseTime({ header: 'x-response-time' }));
  app.use((req: express.Request, res: express.Response, next: () => void) => {
    const correlationId = uuidV4();
    httpContext.set('timestamp', Date.now());
    httpContext.set('correlationId', correlationId);
    req['id'] = correlationId;
    next();
  });
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );
  app.setGlobalPrefix(config.get('service.baseUrl'));
  app.enableCors();
  await initializeSwagger(app);
  const lightship = await initializeLightship(app);
  await app.listen(config.get<number>('server.port'));
  lightship.signalReady();
}

async function initializeLightship(app: INestApplication) {
  const lightship = createLightship();

  lightship.registerShutdownHandler(async () => {
    await app.close();
  });

  return lightship;
}
bootstrap()
  .then(() => {
    const hostname = getHost();
    Logger.log(`Started on http://${hostname}${config.get('service.baseUrl')}`);
    Logger.log(
      `Docs available on http://${hostname}${config.get(
        'service.docsBaseUrl',
      )}`,
    );
  })
  .catch((error) => {
    Logger.error('bootstrap starting error ', error);
  });
