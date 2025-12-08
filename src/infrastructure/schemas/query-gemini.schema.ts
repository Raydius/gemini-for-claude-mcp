import { z } from 'zod';
import { DEFAULT_MODEL } from '../../config/index.js';

/**
 * Factory function to create QueryGeminiInputSchema with configurable default model.
 * Use this when you need to inject the default model from environment config.
 */
export function createQueryGeminiInputSchema(defaultModel: string): z.ZodObject<{
  prompt: z.ZodString;
  model: z.ZodDefault<z.ZodString>;
  systemInstruction: z.ZodOptional<z.ZodString>;
  temperature: z.ZodOptional<z.ZodNumber>;
  maxOutputTokens: z.ZodOptional<z.ZodNumber>;
  history: z.ZodOptional<z.ZodArray<z.ZodObject<{ role: z.ZodEnum<['user', 'model']>; content: z.ZodString }>>>;
  stream: z.ZodDefault<z.ZodBoolean>;
}> {
  return z.object({
    prompt: z.string().min(1, 'Prompt is required').max(100000),
    model: z.string().default(defaultModel),
    systemInstruction: z.string().max(10000).optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxOutputTokens: z.number().int().positive().max(8192).optional(),
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
}

/** Static schema using hardcoded DEFAULT_MODEL - prefer createQueryGeminiInputSchema for runtime config */
export const QueryGeminiInputSchema = createQueryGeminiInputSchema(DEFAULT_MODEL);

export type QueryGeminiInputDto = z.infer<typeof QueryGeminiInputSchema>;
