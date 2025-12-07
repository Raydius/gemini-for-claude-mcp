export interface TokenUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface GeminiResponse {
  readonly text: string;
  readonly model: string;
  readonly finishReason: string;
  readonly usage: TokenUsage;
}

export interface GeminiStreamChunk {
  readonly text: string;
  readonly isComplete: boolean;
}

export interface TokenCountResult {
  readonly totalTokens: number;
  readonly model: string;
}
