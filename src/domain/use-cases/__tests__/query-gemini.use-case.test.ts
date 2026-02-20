import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ok, err } from 'neverthrow';
import { QueryGeminiUseCase } from '../query-gemini.use-case.js';
import type { IGeminiClient } from '../../ports/index.js';
import { ValidationError } from '../../../shared/errors/index.js';
import { GeminiApiError } from '../../errors/index.js';
import { TEST_MODEL, TEST_MODEL_ALT } from '../../../config/models.config.test-utils.js';

describe('QueryGeminiUseCase', () => {
  let mockGeminiClient: jest.Mocked<IGeminiClient>;
  let useCase: QueryGeminiUseCase;

  beforeEach(() => {
    mockGeminiClient = {
      generateContent: jest.fn(),
      generateContentWithHistory: jest.fn(),
      generateContentViaStream: jest.fn(),
      generateContentWithHistoryViaStream: jest.fn(),
      streamGenerateContent: jest.fn(),
      streamGenerateContentWithHistory: jest.fn(),
      countTokens: jest.fn(),
      listModels: jest.fn(),
      getModel: jest.fn(),
    } as unknown as jest.Mocked<IGeminiClient>;
    useCase = new QueryGeminiUseCase(mockGeminiClient);
  });

  describe('execute (streaming default)', () => {
    it('should_returnSuccess_when_validPrompt', async () => {
      const input = { prompt: 'Hello, Gemini!', model: TEST_MODEL };
      const mockResponse = {
        text: 'Hello! How can I help you?',
        model: TEST_MODEL,
        finishReason: 'STOP',
        usage: { promptTokens: 5, completionTokens: 7, totalTokens: 12 },
      };
      mockGeminiClient.generateContentViaStream.mockResolvedValue(ok(mockResponse));

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.response).toBe('Hello! How can I help you?');
        expect(result.value.tokenUsage.total).toBe(12);
      }
    });

    it('should_returnError_when_emptyPrompt', async () => {
      const input = { prompt: '   ', model: TEST_MODEL };

      const result = await useCase.execute(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should_returnError_when_apiCallFails', async () => {
      const input = { prompt: 'Hello', model: TEST_MODEL };
      const apiError = new GeminiApiError('API unavailable');
      mockGeminiClient.generateContentViaStream.mockResolvedValue(err(apiError));

      const result = await useCase.execute(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('GEMINI_API_ERROR');
      }
    });

    it('should_useViaStreamMethod_when_streamIsUndefined', async () => {
      const input = { prompt: 'Hello', model: TEST_MODEL };
      const mockResponse = {
        text: 'Hi!',
        model: TEST_MODEL,
        finishReason: 'STOP',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
      mockGeminiClient.generateContentViaStream.mockResolvedValue(ok(mockResponse));

      await useCase.execute(input);

      expect(mockGeminiClient.generateContentViaStream).toHaveBeenCalled();
      expect(mockGeminiClient.generateContent).not.toHaveBeenCalled();
    });

    it('should_useViaStreamMethod_when_streamIsTrue', async () => {
      const input = { prompt: 'Hello', model: TEST_MODEL, stream: true };
      const mockResponse = {
        text: 'Hi!',
        model: TEST_MODEL,
        finishReason: 'STOP',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
      mockGeminiClient.generateContentViaStream.mockResolvedValue(ok(mockResponse));

      await useCase.execute(input);

      expect(mockGeminiClient.generateContentViaStream).toHaveBeenCalled();
      expect(mockGeminiClient.generateContent).not.toHaveBeenCalled();
    });

    it('should_useViaStreamWithHistoryMethod_when_historyProvided', async () => {
      const input = {
        prompt: 'And what about X?',
        model: TEST_MODEL,
        history: [
          { role: 'user' as const, content: 'Hello' },
          { role: 'model' as const, content: 'Hi there!' },
        ],
      };
      const mockResponse = {
        text: 'X is interesting.',
        model: TEST_MODEL,
        finishReason: 'STOP',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };
      mockGeminiClient.generateContentWithHistoryViaStream.mockResolvedValue(ok(mockResponse));

      await useCase.execute(input);

      expect(mockGeminiClient.generateContentWithHistoryViaStream).toHaveBeenCalled();
      expect(mockGeminiClient.generateContentWithHistory).not.toHaveBeenCalled();
    });

    it('should_passAllParametersToClient', async () => {
      const input = {
        prompt: 'Test',
        model: TEST_MODEL_ALT,
        systemInstruction: 'Be helpful',
        temperature: 0.5,
        maxOutputTokens: 1000,
      };
      const mockResponse = {
        text: 'Response',
        model: TEST_MODEL_ALT,
        finishReason: 'STOP',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
      mockGeminiClient.generateContentViaStream.mockResolvedValue(ok(mockResponse));

      await useCase.execute(input);

      expect(mockGeminiClient.generateContentViaStream).toHaveBeenCalledWith({
        text: 'Test',
        model: TEST_MODEL_ALT,
        systemInstruction: 'Be helpful',
        temperature: 0.5,
        maxOutputTokens: 1000,
        history: undefined,
      });
    });
  });

  describe('execute (stream: false)', () => {
    it('should_useGenerateContent_when_streamIsFalse', async () => {
      const input = { prompt: 'Hello', model: TEST_MODEL, stream: false };
      const mockResponse = {
        text: 'Hi!',
        model: TEST_MODEL,
        finishReason: 'STOP',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
      mockGeminiClient.generateContent.mockResolvedValue(ok(mockResponse));

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      expect(mockGeminiClient.generateContent).toHaveBeenCalled();
      expect(mockGeminiClient.generateContentViaStream).not.toHaveBeenCalled();
    });

    it('should_useGenerateContentWithHistory_when_streamFalseAndHistoryProvided', async () => {
      const input = {
        prompt: 'Follow up',
        model: TEST_MODEL,
        stream: false,
        history: [
          { role: 'user' as const, content: 'Hello' },
          { role: 'model' as const, content: 'Hi!' },
        ],
      };
      const mockResponse = {
        text: 'Follow up response',
        model: TEST_MODEL,
        finishReason: 'STOP',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };
      mockGeminiClient.generateContentWithHistory.mockResolvedValue(ok(mockResponse));

      const result = await useCase.execute(input);

      expect(result.isOk()).toBe(true);
      expect(mockGeminiClient.generateContentWithHistory).toHaveBeenCalled();
      expect(mockGeminiClient.generateContentWithHistoryViaStream).not.toHaveBeenCalled();
    });

    it('should_returnError_when_nonStreamApiCallFails', async () => {
      const input = { prompt: 'Hello', model: TEST_MODEL, stream: false };
      const apiError = new GeminiApiError('API unavailable');
      mockGeminiClient.generateContent.mockResolvedValue(err(apiError));

      const result = await useCase.execute(input);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.code).toBe('GEMINI_API_ERROR');
      }
    });
  });
});
