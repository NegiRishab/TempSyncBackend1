import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  // Get frontend URL from env (supports comma-separated list)
  const frontendUrls = (configService.get<string>("FRONTEND_URL") || "")
    .split(",")
    .map((url) => url.trim());

  app.enableCors({
    origin: frontendUrls,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  const port = configService.get<number>("PORT") || 5000;
  await app.listen(port);

  console.log(`🚀 App is running on  ${port}`);
}
bootstrap();
