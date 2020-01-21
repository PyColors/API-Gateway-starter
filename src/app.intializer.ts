import { INestApplication, INestExpressApplication } from '@nestjs/common';
import { AllExceptionFilter } from '@rsc/nestjs-exceptions';
import { getDefaultLogLevel, Logger } from '@rsc/nestjs-logger';
import { TransformInterceptor } from '@rsc/nestjs-standards';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import * as swaggerStats from 'swagger-stats';

import { apiConfig } from './config/api.config';
import { securityConfig } from './config/security.config';

export class AppInitializer {
  private application: INestExpressApplication & INestApplication;
  private logger: Logger;
  constructor(app: INestExpressApplication & INestApplication) {
    this.application = app;
    this.logger = new Logger('main', getDefaultLogLevel());
  }

  public configure(): void {
    this.application.setGlobalPrefix(apiConfig.basePath);
    this.application.useLogger(this.logger);
    this.application.use(bodyParser.json(securityConfig.payloadLimit));
    this.application.use(cookieParser());
    this.application.use(helmet());
    // this.application.use(csurf(securityConfig.csrf));
    this.application.use(rateLimit(securityConfig.rateLimit));
    this.application.use(swaggerStats.getMiddleware());
    this.application.useGlobalFilters(new AllExceptionFilter());
    this.application.useGlobalInterceptors(new TransformInterceptor());
  }
}