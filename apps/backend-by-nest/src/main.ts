import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // app.enableShutdownHooks();

  app.enableCors({
    origin: (
      origin: string,
      callback: (err: Error | null, origin?: boolean) => void,
    ) => {
      const allowedOrigins = [
        process.env.CORS_ORIGIN,
        process.env.CORS_ORIGIN_1,
      ];
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);

  console.log('当前环境：', process.env.NODE_ENV);

  let flag = false;
  process.on('SIGINT', () => {
    if (flag) return;
    flag = true;
    void (async () => {
      console.log('正在关闭应用...');
      await app.close();
      process.exit(0);
    })();
  });
}
void bootstrap();
