# @zimablue-io/agent-toolkit

A powerful toolkit for building specialized AI agents with custom tool integrations. This framework allows you to create, customize, and deploy AI agents with specific capabilities through a flexible tool-based architecture.

## Installation

```bash
npm install @zimablue-io/agent-toolkit
# or
yarn add @zimablue-io/agent-toolkit
# or
pnpm add @zimablue-io/agent-toolkit
```

## Quick Start

```typescript
import { BaseAgent, BaseTool, createMCPServer } from '@zimablue-io/agent-toolkit'

// Create a specialized agent
const architect = new BaseAgent(
  {
    name: 'architect',
    role: 'Software Architect',
    model: 'gpt-4',
    backstory: 'Expert software architect with deep knowledge of system design...',
    config: {
      temperature: 0.7,
      maxTokens: 2000,
    },
  },
  process.env.OPENAI_API_KEY
)

// Create custom tools
const architectTools = {
  analyzeArchitecture: new BaseTool({
    name: 'analyze-architecture',
    description: 'Analyze current architecture and suggest improvements',
    execute: async ({ context }) => {
      // Your implementation here
      return { analysis: '...', suggestions: ['...'] }
    },
  }),
}

// Add tools to agent
Object.values(architectTools).forEach((tool) => architect.addTool(tool))

// Create and start server
const server = createMCPServer({
  port: 3000,
  logger: { level: 'info' },
})

server.addAgent(architect)
server.start()
```

## Features

- 🤖 Create specialized AI agents with different roles and capabilities
- 🛠 Build custom tools for domain-specific tasks
- 🔄 Share tools between multiple agents
- 📝 Maintain conversation history and context
- 🚀 Easy-to-use HTTP API
- 📊 Built-in logging and monitoring
- 🎯 Type-safe API with TypeScript

## API Reference

### Creating an Agent

```typescript
const agent = new BaseAgent({
  name: string,          // Unique name for the agent
  role: string,          // Role description
  model: string,         // OpenAI model to use
  backstory?: string,    // Optional background story
  config?: {             // Optional configuration
    temperature?: number,
    maxTokens?: number,
    frequencyPenalty?: number,
    presencePenalty?: number
  }
}, apiKey: string)
```

### Creating a Tool

```typescript
const tool = new BaseTool({
  name: string, // Unique name for the tool
  description: string, // Tool description for the AI
  execute: (args: Record<string, unknown>) => Promise<unknown>,
})
```

### Server Configuration

```typescript
const server = createMCPServer({
  port?: number,         // Port to run the server on (default: 3000)
  logger?: {
    level?: string,      // Log level (default: 'info')
    format?: string      // Log format (default: 'json')
  },
  memory?: {
    type: 'memory' | 'redis',
    config?: Record<string, unknown>
  }
})
```

## HTTP API Endpoints

- `GET /agents` - List all available agents
- `GET /agents/:name` - Get details about a specific agent
- `POST /agents/:name/execute` - Execute a prompt with an agent
  ```typescript
  // Request body
  {
    prompt: string,      // The prompt to execute
    tools?: string[]     // Optional list of tool names to use
  }
  ```

## Examples

Check out the `examples` directory for more detailed examples:

- Specialized agents with domain-specific tools
- Multi-agent collaboration
- Custom tool implementation patterns
- Memory and context management

## License

MIT
