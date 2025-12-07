import { type Result, ok, err } from 'neverthrow';
import type { IGeminiClient } from '../ports/index.js';
import type { DomainError } from '../../shared/errors/index.js';
import { ValidationError } from '../../shared/errors/index.js';

export interface CountTokensInput {
  readonly text: string;
  readonly model: string;
}

export interface CountTokensOutput {
  readonly totalTokens: number;
  readonly model: string;
}

export class CountTokensUseCase {
  constructor(private readonly geminiClient: IGeminiClient) {}

  async execute(input: CountTokensInput): Promise<Result<CountTokensOutput, DomainError>> {
    if (input.text.trim().length === 0) {
      return err(new ValidationError('Text cannot be empty'));
    }

    const result = await this.geminiClient.countTokens(input.text, input.model);

    if (result.isErr()) {
      return err(result.error);
    }

    return ok({
      totalTokens: result.value.totalTokens,
      model: result.value.model,
    });
  }
}
