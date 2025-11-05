import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";
import helmet from "helmet";
import { mainLogger } from "./logger";
import sequelize from "sequelize";
import * as morgan from "morgan";
import * as cloudinary from "cloudinary";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: mainLogger,
  });
  app.enableCors({
    origin: "http://localhost:4200",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": [
            "'self'",
            "https://www.google.com/recaptcha/",
            "https://www.gstatic.com/recaptcha/",
          ],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "fonts.googleapis.com/icon",
            "fonts.googleapis.com/css",
          ],
          "font-src": ["'self'", "fonts.gstatic.com"],
          "frame-src": ["'self'", "https://www.google.com/recaptcha/"],
          "script-src-attr": [
            "'self'",
            "'unsafe-inline'",
            "https://www.google.com/recaptcha/",
            "https://www.gstatic.com/recaptcha/",
          ],
        },
      },
    })
  );
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
  app.use(morgan("tiny"));

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        mainLogger.error(" ~ validationErrors", validationErrors);
        return new BadRequestException(validationErrors);
      },
    })
  );

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  await app.listen(process.env.PORT);
}
bootstrap();
