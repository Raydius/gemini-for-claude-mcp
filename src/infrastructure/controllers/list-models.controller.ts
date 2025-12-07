import type { ListModelsUseCase } from '../../domain/use-cases/index.js';
import {
  type McpToolResponse,
  successResponse,
  errorResponse,
} from '../../shared/types/index.js';
import type { GeminiModelSummary } from '../../domain/entities/index.js';

export interface ListModelsResponseData {
  readonly models: readonly GeminiModelSummary[];
  readonly count: number;
}

export class ListModelsController {
  constructor(private readonly useCase: ListModelsUseCase) {}

  async handle(): Promise<McpToolResponse<ListModelsResponseData>> {
    const result = await this.useCase.execute();

    if (result.isErr()) {
      const error = result.error;
      return errorResponse(error.code, error.message);
    }

    return successResponse(result.value);
  }
}
