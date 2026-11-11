import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { join } from 'node:path';
import { AppModule } from './app.module.js';
import { CorsConfig } from './common/constants/cors.constants.js';

async function bootstrap() {

  const configService = new ConfigService()
  const logger = new Logger('Bootstrap', { timestamp: true })


  const app = await NestFactory.create<NestExpressApplication>(AppModule);


  /// GLOBAL ///

  app.useGlobalPipes( new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }))

  app.useGlobalInterceptors(new ClassSerializerInterceptor( app.get(Reflector) ) );

  const publicPath = join(process.cwd(), 'uploads');

  app.useStaticAssets(publicPath, {
    prefix: '/uploads'
  })


  /// DOC ///

  const PORT = configService.get<number>('NEST_PORT') ?? 3000

  const config = new DocumentBuilder()
    .setTitle('Shared-ablum - API')
    .addServer('https://album.danidev.top/api', 'Servidor de producción')
    .addServer(`http://127.0.0.1:${PORT}`, 'Servidor local')
    .setDescription('Documentacion sobre el uso del backend de Shared-Album')
    .setVersion('0.5')
    .build()

  const document = SwaggerModule.createDocument(app, config)


  app.use(
    '/scalar',
    apiReference({
      content: document,
      theme: 'deepSpace',
      darkMode: true
    })
  )
  SwaggerModule.setup('swagger', app, document);


  /// LISTEN ///

  app.enableCors( CorsConfig )
  await app.listen(PORT, '0.0.0.0');

  logger.debug('Servicio ejecutandose en http://localhost:' + PORT)

}
await bootstrap();
