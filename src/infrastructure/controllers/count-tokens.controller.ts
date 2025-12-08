import type { CountTokensUseCase } from '../../domain/use-cases/index.js';
import { CountTokensInputSchema, type CountTokensInputDto } from '../schemas/index.js';
import {
  type McpToolResponse,
  successResponse,
  errorResponse,
} from '../../shared/types/index.js';

export interface CountTokensResponseData {
  readonly totalTokens: number;
  readonly model: string;
}

interface SchemaParser<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } };
}

export class CountTokensController {
  private readonly schema: SchemaParser<CountTokensInputDto>;

  constructor(
    private readonly useCase: CountTokensUseCase,
    schema?: SchemaParser<CountTokensInputDto>,
  ) {
    this.schema = schema ?? CountTokensInputSchema;
  }

  async handle(rawInput: unknown): Promise<McpToolResponse<CountTokensResponseData>> {
    const parsed = this.schema.safeParse(rawInput);

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
