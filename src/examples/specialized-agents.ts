import { BaseAgent, BaseTool, createMCPServer } from '../index'

// Create specialized tools for different domains
const architectTools = {
  analyzeArchitecture: new BaseTool({
    name: 'analyze-architecture',
    description: 'Analyze current architecture and suggest improvements',
    execute: async ({ context }) => {
      // This would contain real implementation
      return {
        analysis: `Architecture analysis for: ${context}`,
        suggestions: ['Suggestion 1', 'Suggestion 2']
      }
    }
  }),
  
  reviewDesign: new BaseTool({
    name: 'review-design',
    description: 'Review system design decisions',
    execute: async ({ design }) => {
      return {
        review: `Design review for: ${design}`,
        recommendations: ['Recommendation 1', 'Recommendation 2']
      }
    }
  })
}

const frontendTools = {
  analyzeComponent: new BaseTool({
    name: 'analyze-component',
    description: 'Analyze React component structure and suggest improvements',
    execute: async ({ component }) => {
      return {
        analysis: `Component analysis for: ${component}`,
        suggestions: ['Suggestion 1', 'Suggestion 2']
      }
    }
  }),
  
  reviewAccessibility: new BaseTool({
    name: 'review-accessibility',
    description: 'Review and suggest accessibility improvements',
    execute: async ({ component }) => {
      return {
        review: `Accessibility review for: ${component}`,
        issues: ['Issue 1', 'Issue 2']
      }
    }
  })
}

// Create specialized agents
const architect = new BaseAgent({
  name: 'architect',
  role: 'Software Architect',
  model: 'gpt-4',
  backstory: 'Expert software architect with deep knowledge of system design patterns, scalability, and best practices.',
  config: {
    temperature: 0.7,
    maxTokens: 2000
  }
}, process.env.OPENAI_API_KEY || '')

const frontendDev = new BaseAgent({
  name: 'frontend-dev',
  role: 'Frontend Developer',
  model: 'gpt-4',
  backstory: 'Senior frontend developer with expertise in React, TypeScript, and modern web development practices.',
  config: {
    temperature: 0.8,
    maxTokens: 1500
  }
}, process.env.OPENAI_API_KEY || '')

// Add domain-specific tools to each agent
Object.values(architectTools).forEach(tool => architect.addTool(tool))
Object.values(frontendTools).forEach(tool => frontendDev.addTool(tool))

// Create shared tools that all agents can use
const sharedTools = {
  codeReview: new BaseTool({
    name: 'code-review',
    description: 'General code review capabilities',
    execute: async ({ files }) => {
      return {
        review: `Code review for: ${files}`,
        issues: ['Issue 1', 'Issue 2']
      }
    }
  })
}

// Add shared tools to all agents
const agents = [architect, frontendDev]
agents.forEach(agent => {
  Object.values(sharedTools).forEach(tool => agent.addTool(tool))
})

// Create and start the server
const server = createMCPServer({
  port: 3000,
  logger: {
    level: 'info',
    format: 'json'
  }
})

// Add agents to the server
agents.forEach(agent => server.addAgent(agent))

// Start the server
server.start()