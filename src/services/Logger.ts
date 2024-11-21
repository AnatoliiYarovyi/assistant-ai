import 'dotenv/config';

import { CloudflareErrorUtility } from 'try-catch-cloud/cloudflare-workers';

export default class LoggerService {
  private errorUtility: CloudflareErrorUtility;
  private tryCatchApiKey: string = process.env.API_KEY_TRY_CATCH_CLOUD;

  constructor() {
    this.errorUtility = new CloudflareErrorUtility(`assistant-dev`, this.tryCatchApiKey);
  }

  public async log(method: string, error: unknown, message: string) {
    await this.errorUtility.sendErrorFromEndPoint(error, {}, { method, message });
  }
}
