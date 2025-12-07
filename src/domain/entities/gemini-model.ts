export interface GeminiModel {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly inputTokenLimit: number;
  readonly outputTokenLimit: number;
  readonly supportedGenerationMethods: readonly string[];
}

export interface GeminiModelSummary {
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
}
