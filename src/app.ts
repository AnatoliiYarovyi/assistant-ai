import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { setupTryCatch } from 'try-catch-cloud/express';

import { errorResponse } from './api/baseResponses';
import { Controller } from './controllers/Controller';

export class App {
  public readonly app: Application;
  public tryCatch: ReturnType<typeof setupTryCatch>;

  constructor(
    private port: number,
    private controllers: Controller[],
  ) {
    this.app = express();
    this.tryCatch = setupTryCatch({
      projectName: 'assistant-dev',
      apiKey: process.env.API_KEY_TRY_CATCH_CLOUD,
    });
    this.app.use(this.tryCatch.initialize);

    this.initializeMiddlewares();
    this.initializeControllers();
    this.initializeBaseError();
  }

  private initializeMiddlewares = () => {
    this.app.use(
      cors({
        origin: '*',
        methods: ['GET', 'PATCH', 'POST', 'DELETE', 'OPTIONS', 'PUT'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
        exposedHeaders: 'X-Total-Count',
        credentials: true,
      }),
    );
    // cookies middleware
    this.app.use(cookieParser());

    this.app.use(express.json());
  };

  private initializeControllers = () => {
    // initialing all controllers
    this.controllers.forEach(controller => {
      this.app.use(controller.path, controller.router);
    });
  };

  private initializeBaseError = () => {
    this.app.use(this.tryCatch.onError);

    this.app.use((_req: Request, res: Response) => {
      console.log('404 error handler triggered');
      res.status(404).json(errorResponse(404, 'The requested API route could not be found.'));
      return;
    });

    this.app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        res.status(400).json(errorResponse(400, 'Invalid JSON syntax'));
        return;
      }
      res.status(500).json(errorResponse(500, 'Something went wrong'));
      return;
    });
  };

  public listen = () => {
    // starting app
    this.app.listen(this.port, () => {
      console.log(`The server is running on port ${this.port}`);
    });
  };
}
