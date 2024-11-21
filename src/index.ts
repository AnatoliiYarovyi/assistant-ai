import 'dotenv/config';

// services
import LoggerService from './services/Logger';
import AssistantService from './services/Assistant';
import PdfService from './services/Pdf';

// controllers
import { AssistantController } from './controllers/Assistant';

// others
import { App } from './app';

async function main() {
  try {
    // services
    const logger = new LoggerService();
    // const assistantService = new AssistantService(logger);
    const pdfService = new PdfService(logger);

    // controllers
    // const assistantController = new AssistantController(logger, assistantService, pdfService);
    const assistantController = new AssistantController(logger, pdfService);

    const port = Number(process.env.PORT) || 5000;
    const app = new App(port, [assistantController]);

    app.listen();
  } catch (error: any) {
    console.error(error);
  }
}

main();
