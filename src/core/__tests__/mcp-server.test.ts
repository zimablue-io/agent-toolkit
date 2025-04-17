import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MCPServer } from '../MCPServer'
import { BaseAgent } from '../BaseAgent'
import type { AgentConfig } from '../../types'
import supertest from 'supertest'

// Mock BaseAgent
vi.mock('../BaseAgent', () => {
  return {
    BaseAgent: vi.fn().mockImplementation((config) => ({
      config,
      execute: vi.fn().mockResolvedValue('Test response'),
      tools: new Map()
    }))
  }
})

describe('MCPServer', () => {
  let server: MCPServer
  let mockAgent: any
  const agentConfig: AgentConfig = {
    name: 'test-agent',
    role: 'test role',
    model: 'gpt-4'
  }

  beforeEach(() => {
    server = new MCPServer({ port: 3001 })
    mockAgent = new BaseAgent(agentConfig, 'test-key')
  })

  it('should add and remove agents', () => {
    server.addAgent(mockAgent)
    expect(server['agents'].get('test-agent')).toBe(mockAgent)

    server.removeAgent('test-agent')
    expect(server['agents'].get('test-agent')).toBeUndefined()
  })

  describe('API Endpoints', () => {
    let request: supertest.SuperTest<supertest.Test>

    beforeEach(() => {
      request = supertest(server['app'])
      server.addAgent(mockAgent)
    })

    it('should list all agents', async () => {
      const response = await request.get('/agents')
      expect(response.status).toBe(200)
      expect(response.body.agents).toHaveLength(1)
      expect(response.body.agents[0].name).toBe('test-agent')
    })

    it('should get specific agent details', async () => {
      const response = await request.get('/agents/test-agent')
      expect(response.status).toBe(200)
      expect(response.body.name).toBe('test-agent')
    })

    it('should return 404 for non-existent agent', async () => {
      const response = await request.get('/agents/non-existent')
      expect(response.status).toBe(404)
    })

    it('should execute agent prompt', async () => {
      const response = await request
        .post('/agents/test-agent/execute')
        .send({ prompt: 'test prompt' })

      expect(response.status).toBe(200)
      expect(response.body.result).toBe('Test response')
      expect(mockAgent.execute).toHaveBeenCalledWith('test prompt', undefined)
    })

    it('should handle execution errors', async () => {
      mockAgent.execute.mockRejectedValueOnce(new Error('Test error'))

      const response = await request
        .post('/agents/test-agent/execute')
        .send({ prompt: 'test prompt' })

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Test error')
    })

    it('should validate execute request body', async () => {
      const response = await request
        .post('/agents/test-agent/execute')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Prompt is required')
    })
  })
})