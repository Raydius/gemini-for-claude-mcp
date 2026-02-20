import { type Result, ok, err } from 'neverthrow';
import type { IGeminiClient } from '../ports/index.js';
import type {
  GeminiPromptWithHistory,
  GeminiResponse,
  GeminiStreamChunk,
} from '../entities/index.js';
import type { DomainError } from '../../shared/errors/index.js';
import { ValidationError } from '../../shared/errors/index.js';

export interface QueryGeminiInput {
  readonly prompt: string;
  readonly model: string;
  readonly systemInstruction?: string | undefined;
  readonly temperature?: number | undefined;
  readonly maxOutputTokens?: number | undefined;
  readonly history?: readonly { role: 'user' | 'model'; content: string }[] | undefined;
  readonly stream?: boolean | undefined;
}

export interface QueryGeminiOutput {
  readonly response: string;
  readonly model: string;
  readonly finishReason: string;
  readonly tokenUsage: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
}

export class QueryGeminiUseCase {
  constructor(private readonly geminiClient: IGeminiClient) {}

  async execute(input: QueryGeminiInput): Promise<Result<QueryGeminiOutput, DomainError>> {
    const validationResult = this.validateInput(input);
    if (validationResult !== null) {
      return err(validationResult);
    }

    const prompt = this.buildPrompt(input);
    const hasHistory = input.history !== undefined && input.history.length > 0;

    const useStreaming = input.stream !== false;

    const result = hasHistory
      ? useStreaming
        ? await this.geminiClient.generateContentWithHistoryViaStream(prompt)
        : await this.geminiClient.generateContentWithHistory(prompt)
      : useStreaming
        ? await this.geminiClient.generateContentViaStream(prompt)
        : await this.geminiClient.generateContent(prompt);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(this.mapResponse(result.value));
  }

  async *executeStream(
    input: QueryGeminiInput,
  ): AsyncGenerator<Result<GeminiStreamChunk, DomainError>, void, unknown> {
    const validationResult = this.validateInput(input);
    if (validationResult !== null) {
      yield err(validationResult);
      return;
    }

    const prompt = this.buildPrompt(input);
    const hasHistory = input.history !== undefined && input.history.length > 0;

    const stream = hasHistory
      ? this.geminiClient.streamGenerateContentWithHistory(prompt)
      : this.geminiClient.streamGenerateContent(prompt);

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  private validateInput(input: QueryGeminiInput): ValidationError | null {
    if (input.prompt.trim().length === 0) {
      return new ValidationError('Prompt cannot be empty');
    }
    return null;
  }

  private buildPrompt(input: QueryGeminiInput): GeminiPromptWithHistory {
    return {
      text: input.prompt,
      model: input.model,
      systemInstruction: input.systemInstruction,
      temperature: input.temperature,
      maxOutputTokens: input.maxOutputTokens,
      history: input.history,
    };
  }

  private mapResponse(response: GeminiResponse): QueryGeminiOutput {
    return {
      response: response.text,
      model: response.model,
      finishReason: response.finishReason,
      tokenUsage: {
        prompt: response.usage.promptTokens,
        completion: response.usage.completionTokens,
        total: response.usage.totalTokens,
      },
    };
  }
}
