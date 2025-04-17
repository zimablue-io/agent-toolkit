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

## Agent Collaboration

The toolkit supports creating collaborative AI agents that can work together to solve complex problems. Here's an example of implementing a collaborative workflow between a backend developer and a solutions architect:

```typescript
import { BaseAgent, BaseTool, createMCPServer } from '@zimablue-io/agent-toolkit'

// Create a tool for architectural review
const architecturalReviewTool = new BaseTool({
  name: 'review-architecture',
  description: 'Review and validate architectural decisions',
  execute: async ({ design, requirements }) => {
    return {
      approved: boolean,
      feedback: string,
      recommendations: string[],
      risks: string[]
    }
  }
})

// Create the solutions architect agent
const architectAgent = new BaseAgent(
  {
    name: 'solutions-architect',
    role: 'Solutions Architect',
    model: 'gpt-4',
    backstory: 'Enterprise solutions architect specializing in scalable systems and microservices',
    config: {
      temperature: 0.7,
      maxTokens: 2000
    }
  },
  process.env.OPENAI_API_KEY
)

// Add review capabilities to architect
architectAgent.addTool(architecturalReviewTool)

// Create a tool for the backend dev to consult the architect
const consultArchitectTool = new BaseTool({
  name: 'consult-architect',
  description: 'Get architectural review and approval',
  execute: async ({ proposal, requirements }) => {
    const review = await architectAgent.execute(
      `Please review this implementation proposal against our requirements:

       Requirements: ${requirements}
       Proposed Implementation: ${proposal}

       Provide detailed feedback on architectural implications.`
    )
    return { review }
  }
})

// Create the backend developer agent
const backendAgent = new BaseAgent(
  {
    name: 'backend-developer',
    role: 'Backend Developer',
    model: 'gpt-4',
    backstory: 'Senior backend developer focused on clean architecture and maintainable code',
    config: {
      temperature: 0.7,
      maxTokens: 2000
    }
  },
  process.env.OPENAI_API_KEY
)

// Enable backend dev to consult with architect
backendAgent.addTool(consultArchitectTool)

// Create and configure the server
const server = createMCPServer({
  port: 3000,
  logger: { level: 'info' }
})

// Register both agents
server.addAgent(architectAgent)
server.addAgent(backendAgent)
server.start()

// Example usage through HTTP API:
// POST /agents/backend-developer/execute
// {
//   "prompt": "Design and implement a new user authentication service with OAuth2 support",
//   "tools": ["consult-architect"]
// }
```

This example demonstrates:

- Creating specialized agents with different roles and responsibilities
- Implementing inter-agent communication through tools
- Setting up a review and approval workflow
- Using agent backstories to define behavior and expertise
- Maintaining separation of concerns while enabling collaboration

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
