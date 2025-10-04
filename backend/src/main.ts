import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS application
 * Configure middleware, validation, CORS, and Swagger documentation
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix for all routes
  const apiPrefix = configService.get('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('NFT Marketplace API')
    .setDescription('Comprehensive NFT marketplace backend API')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('nfts', 'NFT operations')
    .addTag('collections', 'Collection management')
    .addTag('orders', 'Marketplace orders')
    .addTag('bids', 'Auction bidding')
    .addTag('offers', 'NFT offers')
    .addTag('ipfs', 'IPFS storage')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT') || 4000;
  await app.listen(port);

  console.log('=====================================');
  console.log('NFT Marketplace Backend API');
  console.log('=====================================');
  console.log(`Environment: ${configService.get('NODE_ENV')}`);
  console.log(`Server: http://localhost:${port}`);
  console.log(`API: http://localhost:${port}/${apiPrefix}`);
  console.log(`Docs: http://localhost:${port}/docs`);
  console.log(`GraphQL: http://localhost:${port}/graphql`);
  console.log('=====================================');
}

bootstrap();
