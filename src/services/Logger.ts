import 'dotenv/config';

import { CloudflareErrorUtility } from 'try-catch-cloud/cloudflare-workers';

export default class LoggerService {
  private errorUtility: CloudflareErrorUtility;
  private tryCatchApiKey: string = process.env.API_KEY_TRY_CATCH_CLOUD;
  private stage: string = process.env.STAGE;

  constructor() {
    this.errorUtility = new CloudflareErrorUtility(`ptrk-${this.stage}`, this.tryCatchApiKey);
  }

  public async log(method: string, error: unknown, message: string) {
    await this.errorUtility.sendErrorFromEndPoint(error, {}, { method, message });
  }
}
