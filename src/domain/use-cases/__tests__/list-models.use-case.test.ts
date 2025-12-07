import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ok, err } from 'neverthrow';
import { ListModelsUseCase } from '../list-models.use-case.js';
import type { IGeminiClient } from '../../ports/index.js';
import type { GeminiModel } from '../../entities/index.js';
import { GeminiApiError } from '../../errors/index.js';
import {
  FIRST_MODEL,
  SECOND_MODEL,
  createMockModelList,
} from '../../../config/models.config.test-utils.js';

describe('ListModelsUseCase', () => {
  let mockGeminiClient: jest.Mocked<IGeminiClient>;
  let useCase: ListModelsUseCase;

  beforeEach(() => {
    mockGeminiClient = {
      generateContent: jest.fn(),
      generateContentWithHistory: jest.fn(),
      streamGenerateContent: jest.fn(),
      streamGenerateContentWithHistory: jest.fn(),
      countTokens: jest.fn(),
      listModels: jest.fn(),
      getModel: jest.fn(),
    } as unknown as jest.Mocked<IGeminiClient>;
    useCase = new ListModelsUseCase(mockGeminiClient);
  });

  describe('execute', () => {
    it('should_returnSuccess_when_modelsAvailable', async () => {
      const mockModels = createMockModelList(2);
      mockGeminiClient.listModels.mockResolvedValue(ok(mockModels));

      const result = await useCase.execute();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.count).toBe(2);
        expect(result.value.models).toHaveLength(2);
        expect(result.value.models[0]?.name).toBe(FIRST_MODEL?.name);
      }
    });

    it('should_returnSummariesOnly', async () => {
      const mockModels = createMockModelList(1);
      mockGeminiClient.listModels.mockResolvedValue(ok(mockModels));

      const result = await useCase.execute();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const summary = result.value.models[0];
        expect(summary).toEqual({
          name: FIRST_MODEL?.name,
          displayName: FIRST_MODEL?.displayName,
          description: FIRST_MODEL?.description,
        });
        // Should not include inputTokenLimit, outputTokenLimit, etc.
        expect(summary).not.toHaveProperty('inputTokenLimit');
      }
    });

    it('should_returnError_when_apiCallFails', async () => {
      const apiError = new GeminiApiError('API unavailable');
      mockGeminiClient.listModels.mockResolvedValue(err(apiError));

      const result = await useCase.execute();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('GEMINI_API_ERROR');
      }
    });

    it('should_returnEmptyList_when_noModels', async () => {
      mockGeminiClient.listModels.mockResolvedValue(ok([]));

      const result = await useCase.execute();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.count).toBe(0);
        expect(result.value.models).toHaveLength(0);
      }
    });
  });
});
