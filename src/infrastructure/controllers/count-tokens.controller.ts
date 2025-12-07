import type { CountTokensUseCase } from '../../domain/use-cases/index.js';
import { CountTokensInputSchema } from '../schemas/index.js';
import {
  type McpToolResponse,
  successResponse,
  errorResponse,
} from '../../shared/types/index.js';

export interface CountTokensResponseData {
  readonly totalTokens: number;
  readonly model: string;
}

export class CountTokensController {
  constructor(private readonly useCase: CountTokensUseCase) {}

  async handle(rawInput: unknown): Promise<McpToolResponse<CountTokensResponseData>> {
    const parsed = CountTokensInputSchema.safeParse(rawInput);

    if (!parsed.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        parsed.error.issues.map((i) => i.message).join(', '),
      );
    }

    const result = await this.useCase.execute(parsed.data);

    if (result.isErr()) {
      const error = result.error;
      return errorResponse(error.code, error.message);
    }

    return successResponse(result.value);
  }
}
