import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ok, err } from 'neverthrow';
import { QueryGeminiUseCase } from '../query-gemini.use-case.js';
import type { IGeminiClient } from '../../ports/index.js';
import { ValidationError } from '../../../shared/errors/index.js';
import { GeminiApiError } from '../../errors/index.js';

describe('QueryGeminiUseCase', () => {
  let mockGeminiClient: jest.Mocked<IGeminiClient>;
  let useCase: QueryGeminiUseCase;

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
    useCase = new QueryGeminiUseCase(mockGeminiClient);
  });

  describe('execute', () => {
    it('should_returnSuccess_when_validPrompt', async () => {
      const input = { prompt: 'Hello, Gemini!', model: 'gemini-1.5-pro' };
      const mockResponse = {
        text: 'Hello! How can I help you?',
        model: 'gemini-1.5-pro',
        finishReason: 'STOP',
        usage: { promptTokens: 5, completionTokens: 7, totalTokens: 12 },
      };
      mockGeminiClient.generateContent.mockResolvedValue(ok(mockResponse));

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.response).toBe('Hello! How can I help you?');
        expect(result.value.tokenUsage.total).toBe(12);
      }
    });

    it('should_returnError_when_emptyPrompt', async () => {
      const input = { prompt: '   ', model: 'gemini-1.5-pro' };

      const result = await useCase.execute(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should_returnError_when_apiCallFails', async () => {
      const input = { prompt: 'Hello', model: 'gemini-1.5-pro' };
      const apiError = new GeminiApiError('API unavailable');
      mockGeminiClient.generateContent.mockResolvedValue(err(apiError));

      const result = await useCase.execute(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('GEMINI_API_ERROR');
      }
    });

    it('should_useHistoryMethod_when_historyProvided', async () => {
      const input = {
        prompt: 'And what about X?',
        model: 'gemini-1.5-pro',
        history: [
          { role: 'user' as const, content: 'Hello' },
          { role: 'model' as const, content: 'Hi there!' },
        ],
      };
      const mockResponse = {
        text: 'X is interesting.',
        model: 'gemini-1.5-pro',
        finishReason: 'STOP',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };
      mockGeminiClient.generateContentWithHistory.mockResolvedValue(ok(mockResponse));

      await useCase.execute(input);

      expect(mockGeminiClient.generateContentWithHistory).toHaveBeenCalled();
      expect(mockGeminiClient.generateContent).not.toHaveBeenCalled();
    });

    it('should_useGenerateContent_when_noHistoryProvided', async () => {
      const input = { prompt: 'Hello', model: 'gemini-1.5-pro' };
      const mockResponse = {
        text: 'Hi!',
        model: 'gemini-1.5-pro',
        finishReason: 'STOP',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
      mockGeminiClient.generateContent.mockResolvedValue(ok(mockResponse));

      await useCase.execute(input);

      expect(mockGeminiClient.generateContent).toHaveBeenCalled();
      expect(mockGeminiClient.generateContentWithHistory).not.toHaveBeenCalled();
    });

    it('should_passAllParametersToClient', async () => {
      const input = {
        prompt: 'Test',
        model: 'gemini-1.5-flash',
        systemInstruction: 'Be helpful',
        temperature: 0.5,
        maxOutputTokens: 1000,
      };
      const mockResponse = {
        text: 'Response',
        model: 'gemini-1.5-flash',
        finishReason: 'STOP',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
      mockGeminiClient.generateContent.mockResolvedValue(ok(mockResponse));

      await useCase.execute(input);

      expect(mockGeminiClient.generateContent).toHaveBeenCalledWith({
        text: 'Test',
        model: 'gemini-1.5-flash',
        systemInstruction: 'Be helpful',
        temperature: 0.5,
        maxOutputTokens: 1000,
        history: undefined,
      });
    });
  });
});
