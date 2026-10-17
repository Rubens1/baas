import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('BaaS local')
    .setDescription('API BaaS com contas, pagamentos e carteira persistidos no MySQL local')
    .setVersion('1.0')
    .addTag('Wallets', 'Gestão de carteiras e saldos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();

  const PORT = process.env.PORT || 3333;
  await app.listen(PORT);
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📄 Swagger disponível em: http://localhost:${PORT}/api/docs`);
}
bootstrap();