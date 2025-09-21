//import { experimental_createMCPClient } from 'ai'
//import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Example of using an SSE MCP server
// const mcpClient = await experimental_createMCPClient({
//   transport: {
//     type: "sse",
//     url: "http://localhost:8081/sse",
//   },
//   name: "Demo Service",
// });

// Example of using an STDIO MCP server
// const mcpClient = await experimental_createMCPClient({
//   transport: new StdioClientTransport({
//     command: "node",
//     args: [
//       "stdio-server.js",
//     ],
//   }),
// });

// Removed guitar-specific tools

export default async function getTools() {
  // const mcpTools = await mcpCient.tools()
  return {
    // ...mcpTools,
  }
}
