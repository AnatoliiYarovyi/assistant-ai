import 'dotenv/config';
import OpenAI from 'openai';

import LoggerService from './Logger';

export default class AssistantService {
  private openaiApiKey: string = process.env.OPENAI_API_KEY;
  private assistantId: string = process.env.ASSISTANT_ID;
  private openai: OpenAI;
  private shouldDeleteThread: boolean = true;
  private threadId: string = '';
  private run: OpenAI.Beta.Threads.Runs.Run | null = null;
  public summary: OpenAI.Beta.Threads.Messages.MessageContent[] = [];

  constructor(readonly logger: LoggerService) {
    this.openai = new OpenAI({
      apiKey: this.openaiApiKey,
    });
  }

  private async handleError(method: string, error: unknown, message: string): Promise<void> {
    await this.logger.log(method, error, message);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${method}] ${message}: ${errorMessage}`, error);
  }

  /**
   * Creates a new thread.
   */
  private async createThread(): Promise<void> {
    try {
      const response = await this.openai.beta.threads.create();

      const threadId = response.id;

      this.threadId = threadId;
    } catch (error) {
      await this.handleError('createThread', error, 'Error creating thread');
    }
  }

  /**
   * Adds a message to the thread.
   * @param role - The role of the message sender ('user' or 'assistant').
   * @param content - The content of the message.
   */
  private async addMessageToThread(role: 'user' | 'assistant', content: string) {
    try {
      if (this.threadId) {
        const message = await this.openai.beta.threads.messages.create(this.threadId, {
          role,
          content, // question
        });
      } else {
        await this.handleError('addMessageToThread', '', 'Thread ID is not set.');
      }
    } catch (error) {
      await this.handleError('addMessageToThread', error, 'Error adding message to thread');
    }
  }

  /**
   * Runs the assistant on the current thread.
   */
  private async runAssistant() {
    try {
      if (this.threadId) {
        const run = await this.openai.beta.threads.runs.create(this.threadId, {
          assistant_id: this.assistantId,
          // instructions: ''
        });

        this.run = run;
      } else {
        await this.handleError('runAssistant', '', 'Thread ID is not set.');
      }
    } catch (error) {
      await this.handleError('runAssistant', error, 'Error running assistant');
    }
  }

  /**
   * Processes the messages in the thread.
   */
  private async processMessage() {
    try {
      if (this.threadId) {
        const messages = await this.openai.beta.threads.messages.list(this.threadId);
        const summary: OpenAI.Beta.Threads.Messages.MessageContent[] = [];

        if (messages.data.length > 0) {
          const lastMessages = messages.data[0];
          const role = lastMessages.role;
          const response = lastMessages.content;

          summary.push(...response);
        }

        this.summary = summary;
      } else {
        await this.handleError('processMessage', '', 'Thread ID is not set.');
      }
    } catch (error) {
      await this.handleError('processMessage', error, 'Error processing message');
    }
  }

  /**
   * Waits for the assistant run to complete.
   */
  private async waitForCompleted() {
    if (!this.threadId || !this.run) {
      await this.handleError('waitForCompleted', '', 'Thread ID or Run is not set.');
      return;
    }

    let isCompleted: boolean = false;

    while (!isCompleted) {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const runStatus = await this.openai.beta.threads.runs.retrieve(this.threadId, this.run.id);

        if (runStatus.status === 'completed') {
          isCompleted = true;

          await this.processMessage();
        } else if (
          runStatus.status === 'cancelling' ||
          runStatus.status === 'cancelled' ||
          runStatus.status === 'failed' ||
          runStatus.status === 'expired'
        ) {
          isCompleted = true;
          await this.handleError('waitForCompleted', runStatus, 'Run status is not completed');
        }
      } catch (error) {
        await this.handleError('waitForCompleted', error, 'Error retrieving run status');
      }
    }
  }

  private async deleteThread(): Promise<void> {
    try {
      if (this.threadId) {
        await this.openai.beta.threads.del(this.threadId);
        this.threadId = '';
        this.run = null;
        this.summary = [];
      }
    } catch (error) {
      await this.handleError('deleteThread', error, 'Error deleting thread');
    }
  }

  /**
   * Executes the entire workflow of interacting with the assistant.
   * @param question - The question to ask the assistant.
   * @returns The summary of the assistant's response.
   */
  public async executeAssistantWorkflow(question: string): Promise<string | undefined> {
    try {
      await this.createThread();
      await this.addMessageToThread('user', question);
      await this.runAssistant();
      await this.waitForCompleted();

      const result = this.summary
        .filter(item => item.type === 'text')
        .map(item => (item as OpenAI.Beta.Threads.Messages.TextContentBlock).text.value)
        .join(' ');

      return result;
    } catch (error) {
      await this.handleError(
        'executeAssistantWorkflow',
        error,
        'Error executing assistant workflow',
      );
    } finally {
      if (this.shouldDeleteThread) {
        await this.deleteThread();
      }
    }
  }
}
