import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import LoggerService from './Logger';

export default class PdfService {
  constructor(readonly logger: LoggerService) {}

  public async generatePdf(
    assistantAnswer: string,
  ): Promise<{ fileName: string; fileEntry: ArrayBuffer } | undefined> {
    const response = await fetch(`${process.env.PDF_GENERATOR_URL}/pdf/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ template: assistantAnswer }),
    });

    if (!response.ok) {
      await this.logger.log('generatePdf', '', `Pdf generator error ${response.statusText}`);

      return undefined;
    }

    const fileEntry = await response.arrayBuffer();
    const fileName = `${uuidv4()}.pdf`;

    return { fileName, fileEntry };
  }
}
