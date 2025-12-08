import { loadConfig } from './config/index.js';
import { createLogger } from './shared/logger/index.js';
import { GoogleGeminiClientAdapter } from './infrastructure/adapters/index.js';
import {
  QueryGeminiUseCase,
  ListModelsUseCase,
  CountTokensUseCase,
} from './domain/use-cases/index.js';
import {
  QueryGeminiController,
  ListModelsController,
  CountTokensController,
} from './infrastructure/controllers/index.js';
import {
  createQueryGeminiInputSchema,
  createCountTokensInputSchema,
} from './infrastructure/schemas/index.js';
import {
  ToolRegistry,
  McpServer,
  queryGeminiTool,
  listModelsTool,
  countTokensTool,
} from './infrastructure/mcp/index.js';

async function main(): Promise<void> {
  // Load and validate configuration
  const config = loadConfig();
  const logger = createLogger(config.LOG_LEVEL);

  // Override tool schema defaults with environment-configured default model
  const modelSchema = queryGeminiTool.inputSchema.properties as Record<
    string,
    { default?: string }
  >;
  const queryModelProp = modelSchema['model'];
  if (queryModelProp) {
    queryModelProp.default = config.GEMINI_DEFAULT_MODEL;
  }

  const countTokensModelSchema = countTokensTool.inputSchema.properties as Record<
    string,
    { default?: string }
  >;
  const countTokensModelProp = countTokensModelSchema['model'];
  if (countTokensModelProp) {
    countTokensModelProp.default = config.GEMINI_DEFAULT_MODEL;
  }

  logger.info('Starting Gemini MCP Server', { nodeEnv: config.NODE_ENV });

  // Create infrastructure adapters
  const geminiClient = new GoogleGeminiClientAdapter(
    config.GEMINI_API_KEY,
    config.GEMINI_TIMEOUT_MS,
    logger,
  );

  // Create use cases
  const queryGeminiUseCase = new QueryGeminiUseCase(geminiClient);
  const listModelsUseCase = new ListModelsUseCase(geminiClient);
  const countTokensUseCase = new CountTokensUseCase(geminiClient);

  // Create config-aware validation schemas
  const queryGeminiSchema = createQueryGeminiInputSchema(config.GEMINI_DEFAULT_MODEL);
  const countTokensSchema = createCountTokensInputSchema(config.GEMINI_DEFAULT_MODEL);

  // Create controllers with config-aware schemas
  const queryGeminiController = new QueryGeminiController(queryGeminiUseCase, queryGeminiSchema);
  const listModelsController = new ListModelsController(listModelsUseCase);
  const countTokensController = new CountTokensController(countTokensUseCase, countTokensSchema);

  // Register tools
  const toolRegistry = new ToolRegistry();

  toolRegistry.register('query_gemini', {
    tool: queryGeminiTool,
    handler: (args): Promise<unknown> => queryGeminiController.handle(args),
  });

  toolRegistry.register('list_gemini_models', {
    tool: listModelsTool,
    handler: (): Promise<unknown> => listModelsController.handle(),
  });

  toolRegistry.register('count_gemini_tokens', {
    tool: countTokensTool,
    handler: (args): Promise<unknown> => countTokensController.handle(args),
  });

  // Start MCP server
  const server = new McpServer(toolRegistry, logger);
  await server.start();
}

main().catch((error: unknown) => {
  process.stderr.write(`Fatal error: ${String(error)}\n`);
  process.exit(1);
});
