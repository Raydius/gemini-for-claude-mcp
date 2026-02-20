import type { Result } from 'neverthrow';
import type {
  GeminiPrompt,
  GeminiPromptWithHistory,
  GeminiResponse,
  GeminiStreamChunk,
  TokenCountResult,
  GeminiModel,
} from '../entities/index.js';
import type { DomainError } from '../../shared/errors/index.js';

export interface IGeminiClient {
  generateContent(prompt: GeminiPrompt): Promise<Result<GeminiResponse, DomainError>>;

  generateContentWithHistory(
    prompt: GeminiPromptWithHistory,
  ): Promise<Result<GeminiResponse, DomainError>>;

  generateContentViaStream(
    prompt: GeminiPrompt,
  ): Promise<Result<GeminiResponse, DomainError>>;

  generateContentWithHistoryViaStream(
    prompt: GeminiPromptWithHistory,
  ): Promise<Result<GeminiResponse, DomainError>>;

  streamGenerateContent(
    prompt: GeminiPrompt,
  ): AsyncGenerator<Result<GeminiStreamChunk, DomainError>, void, unknown>;

  streamGenerateContentWithHistory(
    prompt: GeminiPromptWithHistory,
  ): AsyncGenerator<Result<GeminiStreamChunk, DomainError>, void, unknown>;

  countTokens(text: string, model: string): Promise<Result<TokenCountResult, DomainError>>;

  listModels(): Promise<Result<readonly GeminiModel[], DomainError>>;

  getModel(modelName: string): Promise<Result<GeminiModel, DomainError>>;
}
