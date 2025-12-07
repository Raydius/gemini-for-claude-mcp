import { DomainError } from '../../shared/errors/index.js';

export class GeminiApiError extends DomainError {
  readonly code = 'GEMINI_API_ERROR';

  constructor(
    readonly message: string,
    readonly statusCode?: number,
  ) {
    super();
  }
}

export class GeminiRateLimitError extends DomainError {
  readonly code = 'GEMINI_RATE_LIMIT';
  readonly message: string;

  constructor(readonly retryAfterMs?: number) {
    super();
    this.message =
      retryAfterMs !== undefined
        ? `Rate limit exceeded. Retry after ${retryAfterMs}ms`
        : 'Rate limit exceeded';
  }
}

export class GeminiModelNotFoundError extends DomainError {
  readonly code = 'GEMINI_MODEL_NOT_FOUND';
  readonly message: string;

  constructor(readonly modelName: string) {
    super();
    this.message = `Model not found: ${modelName}`;
  }
}

export class GeminiContentFilteredError extends DomainError {
  readonly code = 'GEMINI_CONTENT_FILTERED';
  readonly message = 'Content was filtered due to safety settings';
}
