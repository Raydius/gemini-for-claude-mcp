import type { GeminiModel } from '../domain/entities/index.js';
import { GEMINI_MODELS } from './models.config.js';

/**
 * Test utilities for model configuration.
 * Import from here in tests to stay in sync with production config.
 */

// Re-export for tests - single import point
export { GEMINI_MODELS };

/** Primary model for tests - hardcoded for test stability */
export const TEST_MODEL = 'gemini-3-pro-preview';

/** Alternative model for tests that need a different model */
export const TEST_MODEL_ALT = GEMINI_MODELS[0]?.name ?? 'gemini-3-pro-preview';

/** Get the first model from config (useful for mock data) */
export const FIRST_MODEL = GEMINI_MODELS[0];

/** Get the second model from config (useful for mock data) */
export const SECOND_MODEL = GEMINI_MODELS[1];

/**
 * Create mock model data matching real config structure
 */
export function createMockModel(overrides?: Partial<GeminiModel>): GeminiModel {
  const baseModel = GEMINI_MODELS[0];
  if (baseModel === undefined) {
    throw new Error('No models configured in models.config.ts');
  }
  return {
    ...baseModel,
    ...overrides,
  };
}

/**
 * Create an array of mock models for list tests
 */
export function createMockModelList(count = 2): readonly GeminiModel[] {
  return GEMINI_MODELS.slice(0, count);
}
