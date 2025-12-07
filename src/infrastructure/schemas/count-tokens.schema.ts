import { z } from 'zod';

export const CountTokensInputSchema = z.object({
  text: z.string().min(1, 'Text is required').max(1000000),
  model: z.string().default('gemini-1.5-pro'),
});

export type CountTokensInputDto = z.infer<typeof CountTokensInputSchema>;
