# Gemini MCP Server for Claude Code

[![Claude Code](https://img.shields.io/badge/Claude%20Code-MCP%20Server-orange)](https://docs.anthropic.com/en/docs/claude-code)
[![MCP](https://img.shields.io/badge/MCP-Model%20Context%20Protocol-blue)](https://modelcontextprotocol.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)

Give Claude Code access to Google's Gemini AI models. Get second opinions, compare approaches, and leverage Gemini's capabilities—all from within your Claude Code session.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Using with Claude Code](#using-with-claude-code)
- [Configuration](#configuration)
- [Other MCP Clients](#other-mcp-clients)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Tool Reference](#tool-reference)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
# 1. Clone and build
git clone https://github.com/your-username/gemini-for-claude-mcp.git
cd gemini-for-claude-mcp
npm install && npm run build

# 2. Add to Claude Code (replace with your actual path and API key)
claude mcp add gemini -e GEMINI_API_KEY=your-api-key -- node $(pwd)/dist/app.js

# 3. Start Claude Code and try it out
claude
```

Then ask Claude:
> "Query gemini-3-pro-preview: Explain the tradeoffs between microservices and monoliths"

**Any Gemini model works.** Popular: `gemini-3-pro-preview`, `gemini-2.5-pro`, `gemini-2.5-flash` (default). See [all models](https://ai.google.dev/gemini-api/docs/models).

---

## Features

- **Built for Claude Code** - Seamlessly integrates with your Claude Code workflow
- **Streaming Responses** - Enabled by default for real-time output
- **Multi-turn Conversations** - Maintain context across multiple Gemini queries
- **Any Gemini Model** - Use any model including gemini-3-pro-preview, gemini-2.5-pro, and more
- **Token Counting** - Estimate costs before making queries
- **Configurable** - Customize temperature, max tokens, system instructions
- **Type-Safe** - Built with strict TypeScript
- **Well-Tested** - 100% domain layer test coverage

---

## Prerequisites

- **Claude Code** - [Installation guide](https://docs.anthropic.com/en/docs/claude-code)
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Gemini API Key** - [Get one from Google AI Studio](https://aistudio.google.com/app/apikey)

---

## Installation & Setup

### Step 1: Clone and Build

```bash
git clone https://github.com/your-username/gemini-for-claude-mcp.git
cd gemini-for-claude-mcp
npm install
npm run build
```

### Step 2: Add to Claude Code

**Option A: Using the CLI (Recommended)**

```bash
# Basic setup (uses gemini-2.5-flash by default)
claude mcp add gemini -e GEMINI_API_KEY=your-api-key -- node /absolute/path/to/gemini-for-claude-mcp/dist/app.js

# Or set a different default model (any Gemini model works)
claude mcp add gemini \
  -e GEMINI_API_KEY=your-api-key \
  -e GEMINI_DEFAULT_MODEL=gemini-3-pro-preview \
  -- node /absolute/path/to/gemini-for-claude-mcp/dist/app.js
```

**Option B: Manual Configuration**

Edit your Claude Code settings file (`~/.claude.json`):

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-for-claude-mcp/dist/app.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here",
        "GEMINI_DEFAULT_MODEL": "gemini-3-pro-preview"
      }
    }
  }
}
```

**Any Gemini model works.** Popular: `gemini-3-pro-preview` (latest), `gemini-2.5-pro`, `gemini-2.5-flash` (default). See [all models](https://ai.google.dev/gemini-api/docs/models).

### Step 3: Verify Installation

Start Claude Code and verify the server is connected:

```bash
claude
```

Then ask:
> "What Gemini models are available?"

If configured correctly, Claude will use the `list_gemini_models` tool and show you the available models.

---

## Using with Claude Code

Once installed, you can ask Claude to use Gemini in natural language. Here are some examples:

### Specifying a Model

**Any Gemini model works** - just include the model name in your query:

```
You: Ask gemini-3-pro-preview to review this algorithm for edge cases.

You: Use gemini-2.5-flash to quickly summarize this document.

You: Query gemini-2.5-pro about distributed systems design.
```

If you don't specify a model, it uses your configured default (`gemini-2.5-flash` unless you set `GEMINI_DEFAULT_MODEL`). See [all models](https://ai.google.dev/gemini-api/docs/models).

### Get a Second Opinion

```
You: I'm implementing a rate limiter. Can you ask Gemini for its approach?

Claude: I'll query Gemini for an alternative perspective on rate limiting...
[Uses query_gemini tool]

Gemini suggests using a token bucket algorithm. Here's the comparison:
- My approach: Sliding window...
- Gemini's approach: Token bucket with...
```

### Compare Solutions

```
You: Here's my sorting algorithm. Have gemini-3-pro-preview review it and compare approaches.

Claude: Let me get Gemini 3 Pro's analysis of your sorting implementation...
[Uses query_gemini tool with model: gemini-3-pro-preview]

Gemini's feedback: ...
```

### Leverage Gemini's Strengths

```
You: Ask gemini-3-pro-preview to analyze this mathematical proof for logical errors.

Claude: I'll have Gemini 3 Pro examine the proof...
[Uses query_gemini tool with model: gemini-3-pro-preview]
```

### Check Token Usage Before Querying

```
You: How many tokens would this prompt use with gemini-3-pro-preview?

Claude: Let me count the tokens for Gemini 3 Pro...
[Uses count_gemini_tokens tool with model: gemini-3-pro-preview]

This text would use approximately 1,250 tokens with gemini-3-pro-preview.
```

### Multi-turn Conversations

```
You: Start a conversation with Gemini about Rust's ownership model.

Claude: [Uses query_gemini tool]
Gemini explains: Rust's ownership model is based on three rules...

You: Ask Gemini to give an example of borrowing.

Claude: [Uses query_gemini with history from previous turn]
Gemini continues: Here's an example of borrowing...
```

---

## Configuration

Configure the server using environment variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | - | Your Gemini API key from Google AI Studio |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `GEMINI_DEFAULT_MODEL` | No | `gemini-2.5-flash` | Default model for queries |
| `GEMINI_TIMEOUT_MS` | No | `30000` | Request timeout in milliseconds |
| `LOG_LEVEL` | No | `info` | Log level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`) |

---

## Other MCP Clients

While this server is optimized for Claude Code, it works with any MCP-compatible client.

### Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-for-claude-mcp/dist/app.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Generic stdio Clients

This server uses stdio transport. Start it with:

```bash
GEMINI_API_KEY=your-key node dist/app.js
```

The server communicates via stdin/stdout using the MCP protocol.

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Run in development mode with hot reload |
| `npm start` | Run the compiled server |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run typecheck` | Type-check without emitting files |

### Project Structure

```
src/
├── domain/           # Business logic (zero external dependencies)
│   ├── entities/     # Business objects (GeminiModel, GeminiPrompt, etc.)
│   ├── ports/        # Interfaces for external services
│   ├── use-cases/    # Application logic
│   └── errors/       # Domain-specific errors
├── infrastructure/   # External integrations
│   ├── adapters/     # Port implementations
│   ├── controllers/  # MCP request handlers
│   ├── schemas/      # Zod validation schemas
│   └── mcp/          # MCP server and tool definitions
├── config/           # Environment validation
├── shared/           # Cross-cutting utilities
└── app.ts            # Entry point
```

---

## Tool Reference

Technical details for developers integrating with or extending the MCP tools.

### query_gemini

Query Google's Gemini AI models for text generation, reasoning, and analysis tasks.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | The prompt to send to Gemini (1-100,000 chars) |
| `model` | string | No | `gemini-2.5-flash` | Any Gemini model. See [all models](https://ai.google.dev/gemini-api/docs/models) |
| `systemInstruction` | string | No | - | System instruction to set model behavior (max 10,000 chars) |
| `temperature` | number | No | `1.0` | Randomness: 0 = deterministic, 2 = most random |
| `maxOutputTokens` | number | No | varies | Maximum tokens in response (1-8,192) |
| `history` | array | No | - | Previous conversation turns for multi-turn conversations |
| `stream` | boolean | No | `true` | Stream response progressively |

**History Array Item Schema:**

```json
{
  "role": "user" | "model",
  "content": "string"
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "response": "Recursion is a programming technique where a function calls itself...",
    "model": "gemini-3-pro-preview",
    "finishReason": "STOP",
    "tokenUsage": {
      "prompt": 12,
      "completion": 150,
      "total": 162
    }
  }
}
```

---

### list_gemini_models

List popular Gemini AI models. Note: Any valid Gemini model can be used in queries, not just those listed here.

**Parameters:** None

**Example Response:**

```json
{
  "success": true,
  "data": {
    "count": 4,
    "models": [
      {
        "name": "gemini-3-pro-preview",
        "displayName": "Gemini 3 Pro Preview",
        "description": "Most advanced reasoning model with 1M context - best for complex tasks"
      },
      {
        "name": "gemini-2.5-pro",
        "displayName": "Gemini 2.5 Pro",
        "description": "Capable thinking model for complex reasoning, code, math, and STEM"
      },
      {
        "name": "gemini-2.5-flash",
        "displayName": "Gemini 2.5 Flash",
        "description": "Fast and efficient for most tasks with excellent performance"
      },
      {
        "name": "gemini-2.0-flash",
        "displayName": "Gemini 2.0 Flash",
        "description": "Multimodal model optimized for speed and cost-efficiency"
      }
    ]
  }
}
```

---

### count_gemini_tokens

Count the number of tokens in a text string for a specific Gemini model.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | The text to count tokens for (1-1,000,000 chars) |
| `model` | string | No | `gemini-2.5-flash` | Any Gemini model. See [all models](https://ai.google.dev/gemini-api/docs/models) |

**Example Response:**

```json
{
  "success": true,
  "data": {
    "totalTokens": 10,
    "model": "gemini-3-pro-preview"
  }
}
```

---

## Architecture

This project follows **Clean Architecture** (Ports and Adapters) principles:

- **Domain Layer** - Core business logic with zero external dependencies
- **Infrastructure Layer** - External integrations (Gemini SDK, MCP SDK)
- **Strict Dependency Rule** - Dependencies always point inward

For detailed architectural documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Troubleshooting

### Claude Code Issues

**"Server not found" or tools not appearing**
- Verify the MCP server is added: `claude mcp list`
- Check the path to `dist/app.js` is absolute and correct
- Ensure the project has been built: `npm run build`

**"GEMINI_API_KEY is required"**
- Verify your API key is set in the MCP configuration
- Check with: `claude mcp list` to see environment variables

**Server crashes on startup**
- Check Node.js version: `node --version` (must be 20+)
- Verify dependencies are installed: `npm install`

### API Issues

**"Rate limit exceeded"**
- Gemini API has rate limits; wait and retry
- Consider using `gemini-2.0-flash` for higher rate limits

**"Content filtered" error**
- Gemini has content safety filters
- Rephrase your prompt to avoid triggering filters

**Streaming not working**
- Streaming is enabled by default
- Set `stream: false` in your query if needed

### Debug Mode

Enable debug logging for troubleshooting:

```bash
claude mcp add gemini -e GEMINI_API_KEY=your-key -e LOG_LEVEL=debug -- node /path/to/dist/app.js
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes following the code standards in [CLAUDE.md](CLAUDE.md)
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit with conventional commits: `git commit -m "feat: add new feature"`
7. Push and create a Pull Request

### Code Standards

- TypeScript strict mode required
- All exported functions need explicit return types
- Use `neverthrow` Result pattern for error handling
- Validate inputs with Zod at boundaries
- 100% test coverage for domain layer

---

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) - The CLI tool this server is built for
- [Model Context Protocol](https://modelcontextprotocol.io) - The protocol enabling this integration
- [Google Gemini](https://ai.google.dev/) - The AI models powering this server
