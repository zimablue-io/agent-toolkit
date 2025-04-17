import { type OpenAI } from 'openai'

export interface AgentConfig {
  name: string
  role: string
  model: string
  backstory?: string
  config?: {
    temperature?: number
    maxTokens?: number
    frequencyPenalty?: number
    presencePenalty?: number
  }
}

export interface ToolConfig {
  name: string
  description: string
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

export interface MCPServerConfig {
  port?: number
  logger?: {
    level?: string
    format?: string
  }
  memory?: {
    type: 'memory' | 'redis'
    config?: Record<string, unknown>
  }
}

export interface Agent {
  config: AgentConfig
  tools: Map<string, Tool>
  addTool(tool: Tool): void
  removeTool(name: string): void
  execute(prompt: string, tools?: string[]): Promise<unknown>
}

export interface Tool {
  config: ToolConfig
  execute(args: Record<string, unknown>): Promise<unknown>
}

export interface Memory {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  delete(key: string): Promise<void>
}

export type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam