import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export const listModelsTool: Tool = {
  name: 'list_gemini_models',
  description: `List available Gemini AI models and their capabilities.

Use this tool to:
- Discover available Gemini models
- Understand model capabilities and limitations
- Choose the appropriate model for a specific task`,
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};
