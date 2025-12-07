import { z } from 'zod';
import { DEFAULT_MODEL } from '../../config/index.js';

export const CountTokensInputSchema = z.object({
  text: z.string().min(1, 'Text is required').max(1000000),
  model: z.string().default(DEFAULT_MODEL),
});

export type CountTokensInputDto = z.infer<typeof CountTokensInputSchema>;
