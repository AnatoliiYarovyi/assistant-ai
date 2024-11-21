import axios from 'axios';
import { RequestHandler } from 'express';

import { Controller } from './Controller';

import PdfService from '@/services/Pdf';
import LoggerService from '@/services/Logger';
import { errorResponse } from '@/api/baseResponses';
import AssistantService from '@/services/Assistant';

export class AssistantController extends Controller {
  constructor(
    readonly logger: LoggerService,
    readonly pdfService: PdfService,
  ) {
    super('/assistant');

    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/', this.link({ route: this.test }));
    this.router.post('/mcq', this.link({ route: this.mcq }));
  }

  private test: RequestHandler<{}, {}, {}, {}> = async (req, res) => {
    res.json('ok-test');
  };

  private mcq: RequestHandler<
    {},
    {},
    { generatedPdfId?: string; beUrl?: string; question?: string },
    {}
  > = async (req, res) => {
    const assistantService = new AssistantService(this.logger);
    const { generatedPdfId, beUrl, question } = req.body;
    if (!generatedPdfId || !beUrl || !question) {
      res.status(400).json(errorResponse(400, 'generatedPdfId, beUrl and question required'));
      return;
    }

    res.json('ok-test');

    const assistantAnswer = await assistantService.executeAssistantWorkflow(question);

    if (!assistantAnswer) {
      await this.logger.log('mcq', '', `Assistant answer is empty - ${assistantAnswer}`);
      return;
    }

    // save result to db with generatedPdfId

    const generatePdfData = await this.pdfService.generatePdf(assistantAnswer);
    if (!generatePdfData) {
      await this.logger.log('mcq', '', `GeneratePdfData is empty - ${generatePdfData}`);
      return;
    }
    const { fileName, fileEntry } = generatePdfData;

    try {
      const buffer = Buffer.from(fileEntry);
      await axios({
        method: 'patch',
        url: `${beUrl}/quiz/pdf`,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        data: {
          generatedPdfId,
          assistantAnswer,
          fileName,
          fileEntryToBase64: buffer.toString('base64'),
        },
      });
    } catch (e: unknown) {
      console.log('axios error', e);

      await this.logger.log('mcq', e, `axios error`);
    }

    return;
  };
}
