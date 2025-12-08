import { z } from 'zod';
import { DEFAULT_MODEL } from '../../config/index.js';

/**
 * Factory function to create CountTokensInputSchema with configurable default model.
 * Use this when you need to inject the default model from environment config.
 */
export function createCountTokensInputSchema(defaultModel: string): z.ZodObject<{
  text: z.ZodString;
  model: z.ZodDefault<z.ZodString>;
}> {
  return z.object({
    text: z.string().min(1, 'Text is required').max(1000000),
    model: z.string().default(defaultModel),
  });
}

/** Static schema using hardcoded DEFAULT_MODEL - prefer createCountTokensInputSchema for runtime config */
export const CountTokensInputSchema = createCountTokensInputSchema(DEFAULT_MODEL);

export type CountTokensInputDto = z.infer<typeof CountTokensInputSchema>;
