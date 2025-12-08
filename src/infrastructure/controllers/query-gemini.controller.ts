import type { QueryGeminiUseCase } from '../../domain/use-cases/index.js';
import { QueryGeminiInputSchema, type QueryGeminiInputDto } from '../schemas/index.js';
import {
  type McpToolResponse,
  successResponse,
  errorResponse,
} from '../../shared/types/index.js';
import type { GeminiStreamChunk } from '../../domain/entities/index.js';

export interface QueryGeminiResponseData {
  readonly response: string;
  readonly model: string;
  readonly finishReason: string;
  readonly tokenUsage: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
}

interface SchemaParser<T> {
  safeParse(data: unknown): { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } };
}

export class QueryGeminiController {
  private readonly schema: SchemaParser<QueryGeminiInputDto>;

  constructor(
    private readonly useCase: QueryGeminiUseCase,
    schema?: SchemaParser<QueryGeminiInputDto>,
  ) {
    this.schema = schema ?? QueryGeminiInputSchema;
  }

  async handle(rawInput: unknown): Promise<McpToolResponse<QueryGeminiResponseData>> {
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

  async *handleStream(
    rawInput: unknown,
  ): AsyncGenerator<McpToolResponse<GeminiStreamChunk>, void, unknown> {
    const parsed = this.schema.safeParse(rawInput);

    if (!parsed.success) {
      yield errorResponse(
        'VALIDATION_ERROR',
        parsed.error.issues.map((i) => i.message).join(', '),
      );
      return;
    }

    for await (const chunk of this.useCase.executeStream(parsed.data)) {
      if (chunk.isErr()) {
        yield errorResponse(chunk.error.code, chunk.error.message);
        return;
      }
      yield successResponse(chunk.value);
    }
  }
}
