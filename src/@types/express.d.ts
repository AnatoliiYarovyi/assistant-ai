import { ReqUser } from '../dto/env';

declare global {
  namespace Express {
    export interface Request {
      user: ReqUser;
    }
  }
}
