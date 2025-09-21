import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

export const server = new McpServer({
  name: 'demo-server',
  version: '1.0.0',
})
export const transports: { [sessionId: string]: SSEServerTransport } = {}
// Removed guitar-specific tool registration
