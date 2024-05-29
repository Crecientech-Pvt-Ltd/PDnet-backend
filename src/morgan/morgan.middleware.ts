import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    await ConfigModule.envVariablesLoaded;
    if (process.env.NODE_ENV !== 'production') {
      morgan('dev')(req, res, next);
    } else {
      next();
    }
  }
}
