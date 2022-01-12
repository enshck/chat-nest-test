import { NestFactory } from '@nestjs/core';
import { AppModule } from 'modules/app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import variables from 'config/variables';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Chat')
    .setDescription('The Chat API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(variables.port);
}
bootstrap();
