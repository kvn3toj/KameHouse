import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for localhost and local network (WiFi mobile access)
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      // Allow any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x) for frontend ports
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(5173|5174|3000)$/,
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:(5173|5174|3000)$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:(5173|5174|3000)$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  // Listen on all network interfaces (0.0.0.0) for WiFi access
  await app.listen(port, '0.0.0.0');

  console.log(`🏠 KameHouse API is running on: http://0.0.0.0:${port}/api`);
  console.log(`📱 Access from mobile: http://[YOUR_LOCAL_IP]:${port}/api`);
}

bootstrap();
