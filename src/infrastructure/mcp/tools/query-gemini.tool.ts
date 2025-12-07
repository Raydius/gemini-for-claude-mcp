import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { DEFAULT_MODEL, MODEL_OPTIONS_DESCRIPTION } from '../../../config/index.js';

export const queryGeminiTool: Tool = {
  name: 'query_gemini',
  description: `Query Google's Gemini AI models for text generation, reasoning, and analysis tasks.

Use this tool when you need to:
- Get a second opinion or alternative perspective on a problem
- Leverage Gemini's specific capabilities for certain reasoning tasks
- Generate content using a different AI model
- Compare responses between AI models

The tool supports conversation history for multi-turn interactions.
Streaming is enabled by default for better responsiveness.`,
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'The prompt to send to Gemini. Be specific and clear.',
        minLength: 1,
        maxLength: 100000,
      },
      model: {
        type: 'string',
        description: `The Gemini model to use. ${MODEL_OPTIONS_DESCRIPTION}`,
        default: DEFAULT_MODEL,
      },
      systemInstruction: {
        type: 'string',
        description: 'System instruction to set the behavior and persona of the model',
        maxLength: 10000,
      },
      temperature: {
        type: 'number',
        description: 'Controls randomness. 0 = deterministic, 2 = most random. Default: 1.0',
        minimum: 0,
        maximum: 2,
      },
      maxOutputTokens: {
        type: 'number',
        description: 'Maximum tokens in the response. Default varies by model.',
        minimum: 1,
        maximum: 8192,
      },
      history: {
        type: 'array',
        description: 'Previous conversation turns for multi-turn conversations',
        items: {
          type: 'object',
          properties: {
            role: { type: 'string', enum: ['user', 'model'] },
            content: { type: 'string' },
          },
          required: ['role', 'content'],
        },
      },
      stream: {
        type: 'boolean',
        description:
          'Stream response progressively. Enabled by default. Set to false only if you need the complete response at once.',
        default: true,
      },
    },
    required: ['prompt'],
  },
};
