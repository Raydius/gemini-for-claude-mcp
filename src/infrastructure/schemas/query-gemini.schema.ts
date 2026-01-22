import { z } from 'zod';

/**
 * Schema for query_gemini tool input.
 * Model and maxOutputTokens are NOT accepted from client - injected server-side.
 */
export const QueryGeminiInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(100000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      }),
    )
    .optional(),
  stream: z.boolean().default(true),
});

/** Type for QueryGeminiInput - model/maxOutputTokens NOT included, injected server-side */
export interface QueryGeminiInputDto {
  readonly prompt: string;
  readonly history?: ReadonlyArray<{ readonly role: 'user' | 'model'; readonly content: string }> | undefined;
  readonly stream: boolean;
}
