import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import { type Result, ok, err } from 'neverthrow';
import type { IGeminiClient } from '../../domain/ports/index.js';
import type {
  GeminiModel,
  GeminiPrompt,
  GeminiPromptWithHistory,
  GeminiResponse,
  GeminiStreamChunk,
  TokenCountResult,
} from '../../domain/entities/index.js';
import type { DomainError } from '../../shared/errors/index.js';
import { ExternalServiceError, TimeoutError } from '../../shared/errors/index.js';
import {
  GeminiApiError,
  GeminiRateLimitError,
  GeminiContentFilteredError,
  GeminiModelNotFoundError,
} from '../../domain/errors/index.js';
import type { ILogger } from '../../shared/logger/index.js';
import { GEMINI_MODELS } from '../../config/index.js';

export class GoogleGeminiClientAdapter implements IGeminiClient {
  private readonly client: GoogleGenerativeAI;

  constructor(
    apiKey: string,
    private readonly timeoutMs: number,
    private readonly logger: ILogger,
  ) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateContent(prompt: GeminiPrompt): Promise<Result<GeminiResponse, DomainError>> {
    try {
      const model = this.createModel(prompt.model, prompt);
      const result = await this.withTimeout(model.generateContent(prompt.text), this.timeoutMs);
      return ok(this.mapGenerateResponse(result, prompt.model));
    } catch (error) {
      return err(this.mapError(error));
    }
  }

  async generateContentWithHistory(
    prompt: GeminiPromptWithHistory,
  ): Promise<Result<GeminiResponse, DomainError>> {
    try {
      const model = this.createModel(prompt.model, prompt);
      const historyParam =
        prompt.history !== undefined
          ? {
              history: prompt.history.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.content }],
              })),
            }
          : {};
      const chat = model.startChat(historyParam);
      const result = await this.withTimeout(chat.sendMessage(prompt.text), this.timeoutMs);
      return ok(this.mapGenerateResponse(result, prompt.model));
    } catch (error) {
      return err(this.mapError(error));
    }
  }

  async generateContentViaStream(
    prompt: GeminiPrompt,
  ): Promise<Result<GeminiResponse, DomainError>> {
    try {
      const model = this.createModel(prompt.model, prompt);
      const streamResult = await this.withTimeout(
        model.generateContentStream(prompt.text),
        this.timeoutMs,
      );
      return ok(await this.consumeStreamAndMapResponse(streamResult, prompt.model));
    } catch (error) {
      return err(this.mapError(error));
    }
  }

  async generateContentWithHistoryViaStream(
    prompt: GeminiPromptWithHistory,
  ): Promise<Result<GeminiResponse, DomainError>> {
    try {
      const model = this.createModel(prompt.model, prompt);
      const historyParam =
        prompt.history !== undefined
          ? {
              history: prompt.history.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.content }],
              })),
            }
          : {};
      const chat = model.startChat(historyParam);
      const streamResult = await this.withTimeout(
        chat.sendMessageStream(prompt.text),
        this.timeoutMs,
      );
      return ok(await this.consumeStreamAndMapResponse(streamResult, prompt.model));
    } catch (error) {
      return err(this.mapError(error));
    }
  }

  async *streamGenerateContent(
    prompt: GeminiPrompt,
  ): AsyncGenerator<Result<GeminiStreamChunk, DomainError>, void, unknown> {
    try {
      const model = this.createModel(prompt.model, prompt);
      const result = await model.generateContentStream(prompt.text);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield ok({ text, isComplete: false });
      }
      yield ok({ text: '', isComplete: true });
    } catch (error) {
      yield err(this.mapError(error));
    }
  }

  async *streamGenerateContentWithHistory(
    prompt: GeminiPromptWithHistory,
  ): AsyncGenerator<Result<GeminiStreamChunk, DomainError>, void, unknown> {
    try {
      const model = this.createModel(prompt.model, prompt);
      const historyParam =
        prompt.history !== undefined
          ? {
              history: prompt.history.map((msg) => ({
                role: msg.role,
                parts: [{ text: msg.content }],
              })),
            }
          : {};
      const chat = model.startChat(historyParam);
      const result = await chat.sendMessageStream(prompt.text);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield ok({ text, isComplete: false });
      }
      yield ok({ text: '', isComplete: true });
    } catch (error) {
      yield err(this.mapError(error));
    }
  }

  async countTokens(text: string, modelName: string): Promise<Result<TokenCountResult, DomainError>> {
    try {
      const model = this.client.getGenerativeModel({ model: modelName });
      const result = await this.withTimeout(model.countTokens(text), this.timeoutMs);
      return ok({ totalTokens: result.totalTokens, model: modelName });
    } catch (error) {
      return err(this.mapError(error));
    }
  }

  async listModels(): Promise<Result<readonly GeminiModel[], DomainError>> {
    return ok(GEMINI_MODELS);
  }

  async getModel(modelName: string): Promise<Result<GeminiModel, DomainError>> {
    const model = GEMINI_MODELS.find((m) => m.name === modelName);
    if (model === undefined) {
      return err(new GeminiModelNotFoundError(modelName));
    }
    return ok(model);
  }

  private createModel(modelName: string, config: Partial<GeminiPrompt>): GenerativeModel {
    const generationConfig: Record<string, number> = {};
    if (config.temperature !== undefined) {
      generationConfig['temperature'] = config.temperature;
    }
    if (config.maxOutputTokens !== undefined) {
      generationConfig['maxOutputTokens'] = config.maxOutputTokens;
    }
    if (config.topP !== undefined) {
      generationConfig['topP'] = config.topP;
    }
    if (config.topK !== undefined) {
      generationConfig['topK'] = config.topK;
    }

    return this.client.getGenerativeModel({
      model: modelName,
      ...(config.systemInstruction !== undefined && {
        systemInstruction: config.systemInstruction,
      }),
      ...(Object.keys(generationConfig).length > 0 && { generationConfig }),
    });
  }

  private mapGenerateResponse(
    result: { response: { text: () => string; usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }; candidates?: Array<{ finishReason?: string }> } },
    model: string,
  ): GeminiResponse {
    const response = result.response;
    const usage = response.usageMetadata;
    return {
      text: response.text(),
      model,
      finishReason: response.candidates?.[0]?.finishReason ?? 'UNKNOWN',
      usage: {
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
        totalTokens: usage?.totalTokenCount ?? 0,
      },
    };
  }

  private async consumeStreamAndMapResponse(
    streamResult: {
      stream: AsyncIterable<{ text: () => string }>;
      response: Promise<{
        text: () => string;
        usageMetadata?: {
          promptTokenCount?: number;
          candidatesTokenCount?: number;
          totalTokenCount?: number;
        };
        candidates?: Array<{ finishReason?: string }>;
      }>;
    },
    model: string,
  ): Promise<GeminiResponse> {
    // Consuming chunks keeps the connection alive, preventing timeout.
    // The aggregated response below contains the full text and metadata.
    for await (const chunk of streamResult.stream) {
      void chunk.text();
    }
    const finalResponse = await streamResult.response;
    return this.mapGenerateResponse({ response: finalResponse }, model);
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, ms);
    });
    return Promise.race([promise, timeout]);
  }

  private mapError(error: unknown): DomainError {
    if (error instanceof Error) {
      if (error.message === 'TIMEOUT') {
        return new TimeoutError('Request timed out', this.timeoutMs);
      }

      const message = error.message.toLowerCase();

      if (message.includes('rate limit') || message.includes('429')) {
        return new GeminiRateLimitError();
      }
      if (message.includes('not found') || message.includes('404')) {
        return new GeminiModelNotFoundError('unknown');
      }
      if (message.includes('safety') || message.includes('blocked')) {
        return new GeminiContentFilteredError();
      }

      this.logger.error('Gemini API error', { error: error.message });
      return new GeminiApiError(error.message);
    }
    return new ExternalServiceError('Unknown error occurred', 'Gemini');
  }
}
