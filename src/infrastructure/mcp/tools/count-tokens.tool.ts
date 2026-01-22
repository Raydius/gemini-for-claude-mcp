import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const countTokensTool: Tool = {
  name: 'count_gemini_tokens',
  description: `Count the number of tokens in a text string for the configured Gemini model.

Use this tool to:
- Estimate prompt costs before making queries
- Ensure prompts fit within model context limits
- Optimize prompt length for efficiency`,
  inputSchema: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        description: 'The text to count tokens for',
        minLength: 1,
        maxLength: 1000000,
      },
    },
    required: ['text'],
  },
};
