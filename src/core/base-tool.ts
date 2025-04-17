import { type Tool, type ToolConfig } from '../types'

export class BaseTool implements Tool {
  constructor(public readonly config: ToolConfig) {}

  async execute(args: Record<string, unknown>): Promise<unknown> {
    return this.config.execute(args)
  }
}