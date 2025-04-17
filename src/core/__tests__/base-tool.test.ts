import { describe, it, expect, vi } from 'vitest'
import { BaseTool } from '../BaseTool'
import type { ToolConfig } from '../../types'

describe('BaseTool', () => {
  it('should create a tool with the correct configuration', () => {
    const config: ToolConfig = {
      name: 'test-tool',
      description: 'A test tool',
      execute: async () => ({ result: 'test' })
    }

    const tool = new BaseTool(config)
    expect(tool.config).toEqual(config)
  })

  it('should execute the tool with provided arguments', async () => {
    const mockExecute = vi.fn().mockResolvedValue({ result: 'test' })
    const config: ToolConfig = {
      name: 'test-tool',
      description: 'A test tool',
      execute: mockExecute
    }

    const tool = new BaseTool(config)
    const args = { param: 'value' }
    await tool.execute(args)

    expect(mockExecute).toHaveBeenCalledWith(args)
  })

  it('should handle execution errors', async () => {
    const error = new Error('Test error')
    const config: ToolConfig = {
      name: 'test-tool',
      description: 'A test tool',
      execute: async () => { throw error }
    }

    const tool = new BaseTool(config)
    await expect(tool.execute({})).rejects.toThrow(error)
  })
})