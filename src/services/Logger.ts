import 'dotenv/config';

import { CloudflareErrorUtility } from 'try-catch-cloud/cloudflare-workers';

export default class LoggerService {
  private errorUtility: CloudflareErrorUtility;
  private tryCatchApiKey: string = process.env.API_KEY_TRY_CATCH_CLOUD;
  private tryCatchName: string = process.env.TRY_CATCH_NAME;

  constructor() {
    this.errorUtility = new CloudflareErrorUtility(this.tryCatchName, this.tryCatchApiKey);
  }

  public async log(method: string, error: unknown, message: string) {
    await this.errorUtility.sendErrorFromEndPoint(error, {}, { method, message });
  }
}
