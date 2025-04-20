import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as compression from 'compression';
import { json } from 'express';
import * as basicAuth from 'express-basic-auth';
import { MainModule } from './main.module';

async function bootstrap() {
  const appOptions = { cors: true };
  const app = await NestFactory.create(MainModule, appOptions);

  useContainer(app.select(MainModule), {
    fallbackOnErrors: true
  });

  app.use(json({ limit: '10mb' }));
  app.use(compression());

  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );

  const options = new DocumentBuilder()
    .setTitle('Auto Browser')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'api-key', in: 'header' }, 'api-key')
    .build();

  app.use(
    '/api-docs',
    basicAuth({
      users: {
        [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD
      },
      challenge: true
    })
  );

  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true
  });

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      filter: true
    }
  });

  await app.listen(process.env.APP_PORT || 5008, () => {
    console.log(`Listen on port ${process.env.APP_PORT || 5008}`);
  });
}

bootstrap();
