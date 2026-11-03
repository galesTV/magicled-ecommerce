import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validação automática dos DTOs nas requisições
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Permite requisições vindo da aplicação React/Next.js
  app.enableCors();

  // Configuração da Documentação Swagger
  const config = new DocumentBuilder()
    .setTitle('Magic LED - E-commerce API')
    .setDescription(
      'Documentação das rotas REST da API do e-commerce Magic LED',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(
    `📄 Documentação Swagger disponível em: http://localhost:${port}/api/docs`,
  );
}
bootstrap();
