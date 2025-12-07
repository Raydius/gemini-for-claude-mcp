import { type Result, ok, err } from 'neverthrow';
import type { IGeminiClient } from '../ports/index.js';
import type { GeminiModelSummary } from '../entities/index.js';
import type { DomainError } from '../../shared/errors/index.js';

export interface ListModelsOutput {
  readonly models: readonly GeminiModelSummary[];
  readonly count: number;
}

export class ListModelsUseCase {
  constructor(private readonly geminiClient: IGeminiClient) {}

  async execute(): Promise<Result<ListModelsOutput, DomainError>> {
    const result = await this.geminiClient.listModels();

    if (result.isErr()) {
      return err(result.error);
    }

    const models = result.value;

    const summaries: readonly GeminiModelSummary[] = models.map((model) => ({
      name: model.name,
      displayName: model.displayName,
      description: model.description,
    }));

    return ok({
      models: summaries,
      count: summaries.length,
    });
  }
}
