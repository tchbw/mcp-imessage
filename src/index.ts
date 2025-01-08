import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getRecentChatMessages, sendIMessage } from "./imessage.js";

// Create server instance
const server = new Server(
  {
    name: "imessage",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get-recent-chat-messages",
        description: "Retrieve recent iMessage chat messages",
        inputSchema: {
          type: "object",
          properties: {
            phoneNumber: { type: "string", description: "Person's phone number" },
            limit: { type: "number", description: "Number of messages to fetch" },
          },
          required: ["phoneNumber", "limit"],
        },
      },
      {
        name: "send-imessage",
        description: "Send an iMessage to a phone number",
        inputSchema: {
          type: "object",
          properties: {
            phoneNumber: { type: "string", description: "Recipient's phone number" },
            message: { type: "string", description: "Message content" },
          },
          required: ["phoneNumber", "message"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "get-recent-chat-messages": {
      const { phoneNumber, limit } = args as { phoneNumber: string; limit: number };
      const messages = await getRecentChatMessages(phoneNumber, limit);
      return { content: [
        {type: "text",
        text: JSON.stringify(messages)},
      ]};
    }

    case "send-imessage": {
      const { phoneNumber, message } = args as {
        phoneNumber: string;
        message: string;
      };
      await sendIMessage(phoneNumber, message);
      return { content: [
        {type: "text",
        text: "Message sent successfully"},
      ]};
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
