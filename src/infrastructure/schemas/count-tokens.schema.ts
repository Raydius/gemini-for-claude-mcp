import { z } from 'zod';

/**
 * Schema for count_gemini_tokens tool input.
 * Model is NOT accepted from client - it's injected server-side from GEMINI_DEFAULT_MODEL.
 */
export const CountTokensInputSchema = z.object({
  text: z.string().min(1, 'Text is required').max(1000000),
});

/** Type for CountTokensInput - model is NOT included, injected server-side */
export interface CountTokensInputDto {
  readonly text: string;
}
