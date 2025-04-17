import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseAgent } from '../BaseAgent'
import { BaseTool } from '../BaseTool'
import type { AgentConfig, ToolConfig } from '../../types'

// Mock OpenAI
vi.mock('openai', () => {
  return {
    OpenAI: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Test response',
                tool_calls: null
              }
            }]
          })
        }
      }
    }))
  }
})

describe('BaseAgent', () => {
  let agent: BaseAgent
  let config: AgentConfig
  
  beforeEach(() => {
    config = {
      name: 'test-agent',
      role: 'test role',
      model: 'gpt-4',
      backstory: 'test backstory',
      config: {
        temperature: 0.7,
        maxTokens: 1000
      }
    }
    agent = new BaseAgent(config, 'test-api-key')
  })

  it('should create an agent with the correct configuration', () => {
    expect(agent.config).toEqual(config)
  })

  it('should add and remove tools', () => {
    const toolConfig: ToolConfig = {
      name: 'test-tool',
      description: 'A test tool',
      execute: async () => ({ result: 'test' })
    }
    const tool = new BaseTool(toolConfig)

    agent.addTool(tool)
    expect(agent.tools.get('test-tool')).toBe(tool)

    agent.removeTool('test-tool')
    expect(agent.tools.get('test-tool')).toBeUndefined()
  })

  it('should execute a prompt and return response', async () => {
    const response = await agent.execute('test prompt')
    expect(response).toBe('Test response')
  })

  it('should maintain conversation history', async () => {
    await agent.execute('test prompt')
    const history = agent.conversationHistory

    expect(history[0]).toMatchObject({
      role: 'system',
      content: expect.stringContaining(config.name)
    })
    expect(history[1]).toMatchObject({
      role: 'user',
      content: 'test prompt'
    })
    expect(history[2]).toMatchObject({
      role: 'assistant',
      content: 'Test response'
    })
  })
})