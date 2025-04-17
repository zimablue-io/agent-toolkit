import { OpenAI } from 'openai'
import { type Agent, type AgentConfig, type Tool, type ChatMessage } from '../types'

export class BaseAgent implements Agent {
  protected client: OpenAI
  public tools: Map<string, Tool>
  protected messages: ChatMessage[]

  constructor(
    public readonly config: AgentConfig,
    apiKey: string
  ) {
    this.client = new OpenAI({ apiKey })
    this.tools = new Map()
    this.messages = [
      {
        role: 'system',
        content: `You are ${config.name}, acting as ${config.role}.${config.backstory ? '\n' + config.backstory : ''}`,
      },
    ]
  }

  addTool(tool: Tool): void {
    this.tools.set(tool.config.name, tool)
  }

  removeTool(name: string): void {
    this.tools.delete(name)
  }

  async execute(prompt: string, toolNames?: string[]): Promise<unknown> {
    // Add user message to conversation
    this.messages.push({ role: 'user', content: prompt })

    // Get available tools for this execution
    const availableTools = toolNames
      ? new Map([...this.tools].filter(([name]) => toolNames.includes(name)))
      : this.tools

    // Create tool descriptions for the model
    const toolDescriptions = [...availableTools].map(([_, tool]) => ({
      name: tool.config.name,
      description: tool.config.description,
    }))

    try {
      // Get model's response
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          ...this.messages,
          {
            role: 'system',
            content: `Available tools:\n${JSON.stringify(toolDescriptions, null, 2)}`,
          },
        ],
        temperature: this.config.config?.temperature ?? 0.7,
        max_tokens: this.config.config?.maxTokens,
        frequency_penalty: this.config.config?.frequencyPenalty,
        presence_penalty: this.config.config?.presencePenalty,
      })

      const response = completion.choices[0].message

      // Add assistant's response to conversation history
      this.messages.push({
        role: 'assistant',
        content: response.content || '',
      })

      // Parse tool calls if any
      if (response.tool_calls) {
        const results = await Promise.all(
          response.tool_calls.map(async (toolCall) => {
            const tool = availableTools.get(toolCall.function.name)
            if (!tool) {
              throw new Error(`Tool ${toolCall.function.name} not found`)
            }

            const args = JSON.parse(toolCall.function.arguments)
            return await tool.execute(args)
          })
        )

        // Add tool results to conversation
        this.messages.push({
          role: 'system',
          content: `Tool execution results:\n${JSON.stringify(results, null, 2)}`,
        })

        return results
      }

      return response.content
    } catch (error) {
      // Add error to conversation history
      this.messages.push({
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      throw error
    }
  }

  get conversationHistory(): ChatMessage[] {
    return [...this.messages]
  }
}
