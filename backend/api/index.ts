import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    const expressAdapter = new ExpressAdapter(server);
    app = await NestFactory.create(AppModule, expressAdapter);

    app.enableCors({
      origin: /^https:\/\/.*\.vercel\.app$/,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.setGlobalPrefix('api');
    await app.init();
  }
  return server;
}

export default async (req: any, res: any) => {
  await bootstrap();
  server(req, res);
};
