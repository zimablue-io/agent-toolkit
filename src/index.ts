// Core exports
export { BaseAgent } from './core/base-agent'
export { BaseTool } from './core/base-tool'
export { MCPServer } from './core/mcp-server'

// Type exports
export type {
  Agent,
  AgentConfig,
  Tool,
  ToolConfig,
  MCPServerConfig,
  Memory,
  ChatMessage,
} from './types'

import { type MCPServerConfig } from './types'
import { MCPServer } from './core/mcp-server'

// Convenience function to create a server
export function createMCPServer(config?: MCPServerConfig): MCPServer {
  return new MCPServer(config)
}
