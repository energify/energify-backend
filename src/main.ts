import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { EntityNotFoundFilter } from "./shared/filters/entity-not-found.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("Energify")
    .setDescription("The energify API description")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new EntityNotFoundFilter());

  SwaggerModule.setup("api", app, document);
  await app.listen(process.env.PORT);
}

bootstrap();
