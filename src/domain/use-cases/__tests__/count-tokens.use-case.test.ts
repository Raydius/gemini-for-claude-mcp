import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ok, err } from 'neverthrow';
import { CountTokensUseCase } from '../count-tokens.use-case.js';
import type { IGeminiClient } from '../../ports/index.js';
import { ValidationError } from '../../../shared/errors/index.js';
import { GeminiApiError } from '../../errors/index.js';
import { TEST_MODEL, TEST_MODEL_ALT } from '../../../config/models.config.test-utils.js';

describe('CountTokensUseCase', () => {
  let mockGeminiClient: jest.Mocked<IGeminiClient>;
  let useCase: CountTokensUseCase;

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
    useCase = new CountTokensUseCase(mockGeminiClient);
  });

  describe('execute', () => {
    it('should_returnSuccess_when_validText', async () => {
      const input = { text: 'Hello, world!', model: TEST_MODEL };
      mockGeminiClient.countTokens.mockResolvedValue(
        ok({ totalTokens: 4, model: TEST_MODEL }),
      );

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.totalTokens).toBe(4);
        expect(result.value.model).toBe(TEST_MODEL);
      }
    });

    it('should_returnError_when_emptyText', async () => {
      const input = { text: '   ', model: TEST_MODEL };

      const result = await useCase.execute(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.code).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Text cannot be empty');
      }
    });

    it('should_returnError_when_apiCallFails', async () => {
      const input = { text: 'Hello', model: TEST_MODEL };
      const apiError = new GeminiApiError('API unavailable');
      mockGeminiClient.countTokens.mockResolvedValue(err(apiError));

      const result = await useCase.execute(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('GEMINI_API_ERROR');
      }
    });

    it('should_passCorrectParametersToClient', async () => {
      const input = { text: 'Test text', model: TEST_MODEL_ALT };
      mockGeminiClient.countTokens.mockResolvedValue(
        ok({ totalTokens: 2, model: TEST_MODEL_ALT }),
      );

      await useCase.execute(input);

      expect(mockGeminiClient.countTokens).toHaveBeenCalledWith('Test text', TEST_MODEL_ALT);
    });

    it('should_handleLargeTokenCounts', async () => {
      const input = { text: 'Large text'.repeat(1000), model: TEST_MODEL };
      mockGeminiClient.countTokens.mockResolvedValue(
        ok({ totalTokens: 10000, model: TEST_MODEL }),
      );

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.totalTokens).toBe(10000);
      }
    });
  });
});
