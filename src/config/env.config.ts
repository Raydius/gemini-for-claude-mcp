import { z } from 'zod';

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GEMINI_DEFAULT_MODEL: z.string().min(1, 'GEMINI_DEFAULT_MODEL is required'),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(65536),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(300000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function loadConfig(): EnvConfig {
  const parsed = EnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuration validation failed:\n${formatted}`);
  }

  return parsed.data;
}
