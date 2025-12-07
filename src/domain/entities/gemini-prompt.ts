export interface GeminiMessage {
  readonly role: 'user' | 'model';
  readonly content: string;
}

export interface GeminiPrompt {
  readonly text: string;
  readonly model: string;
  readonly systemInstruction?: string | undefined;
  readonly temperature?: number | undefined;
  readonly maxOutputTokens?: number | undefined;
  readonly topP?: number | undefined;
  readonly topK?: number | undefined;
}

export interface GeminiPromptWithHistory extends GeminiPrompt {
  readonly history?: readonly GeminiMessage[] | undefined;
}
