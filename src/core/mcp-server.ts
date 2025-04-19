import express, {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from 'express'
import { createLogger, format, transports } from 'winston'
import { type Agent, type MCPServerConfig } from '../types'

export class MCPServer {
  private app = express()
  private agents = new Map<string, Agent>()
  private logger

  constructor(private config: MCPServerConfig = {}) {
    // Setup logger
    this.logger = createLogger({
      level: config.logger?.level || 'info',
      format: format.combine(format.timestamp(), format.json()),
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
      ],
    })

    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware(): void {
    this.app.use(express.json())
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      this.logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body,
      })
      next()
    })
  }

  private setupRoutes(): void {
    // List all agents
    this.app.get('/agents', ((_req: Request, res: Response) => {
      const agentList = [...this.agents.values()].map((agent) => ({
        name: agent.config.name,
        role: agent.config.role,
        tools: [...agent.tools.values()].map((tool) => ({
          name: tool.config.name,
          description: tool.config.description,
        })),
      }))
      res.json({ agents: agentList })
    }) as RequestHandler)

    // Get specific agent
    this.app.get('/agents/:name', ((req: Request, res: Response) => {
      const agent = this.agents.get(req.params.name)
      if (!agent) {
        return res.status(404).json({ error: `Agent ${req.params.name} not found` })
      }

      res.json({
        name: agent.config.name,
        role: agent.config.role,
        tools: [...agent.tools.values()].map((tool) => ({
          name: tool.config.name,
          description: tool.config.description,
        })),
      })
    }) as RequestHandler)

    // Execute agent with prompt
    this.app.post('/agents/:name/execute', (async (req: Request, res: Response) => {
      const { prompt, tools } = req.body
      const agent = this.agents.get(req.params.name)

      if (!agent) {
        return res.status(404).json({ error: `Agent ${req.params.name} not found` })
      }

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' })
      }

      try {
        const result = await agent.execute(prompt, tools)
        res.json({ result })
      } catch (error) {
        this.logger.error('Execution error:', error)
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }) as RequestHandler)

    // Error handler
    this.app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
      this.logger.error('Server error:', err)
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      })
      next(err)
    })
  }

  addAgent(agent: Agent): void {
    this.agents.set(agent.config.name, agent)
    this.logger.info(`Added agent: ${agent.config.name}`)
  }

  removeAgent(name: string): void {
    this.agents.delete(name)
    this.logger.info(`Removed agent: ${name}`)
  }

  start(): void {
    const port = this.config.port || 3000
    this.app.listen(port, () => {
      this.logger.info(`MCP Server running on port ${port}`)
    })
  }
}
