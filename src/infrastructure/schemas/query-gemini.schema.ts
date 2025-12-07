import { z } from 'zod';
import { DEFAULT_MODEL } from '../../config/index.js';

export const QueryGeminiInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(100000),
  model: z.string().default(DEFAULT_MODEL),
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

export type QueryGeminiInputDto = z.infer<typeof QueryGeminiInputSchema>;
