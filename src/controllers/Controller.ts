import { RequestHandler, Router, Request, Response, NextFunction } from 'express';
import 'dotenv/config';

export abstract class Controller {
  public readonly router: Router;

  constructor(public readonly path: string) {
    this.router = Router();
  }

  /**
   * This method allows to catch all errors in the router
   * And depending on error type respond with needed response
   * @param route
   * @return RequestHandler
   */
  public link = ({ route }: { route: any }): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        await route(req, res, next);
      } catch (error: any) {
        console.log(error);

        return next();
      }
    };
  };
}
