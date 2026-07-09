#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

// Mock implementation of the generate-image tool
class ImageGenerationService {
  async generateImage(prompt: string, style?: string, resolution?: string): Promise<{ imageUrl: string; prompt: string }> {
    // Simulate image generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock image URL generation
    const mockImageUrl = `https://example.com/generated-image-${Date.now()}.png`;
    
    return {
      imageUrl: mockImageUrl,
      prompt: prompt
    };
  }
}

const service = new ImageGenerationService();

const server = new Server(
  {
    name: 'ai-asset-studio-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Set up tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate-image',
      description: 'Generate an image from a text prompt',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The text prompt to generate an image from'
          },
          style: {
            type: 'string',
            description: 'The style of the image (e.g., realistic, cartoon, abstract)'
          },
          resolution: {
            type: 'string',
            description: 'The resolution of the generated image (e.g., 1024x1024, 512x512)'
          }
        },
        required: ['prompt'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'generate-image') {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool: ${request.params.name}`
    );
  }

  try {
    const { prompt, style, resolution } = request.params.arguments || {};
    
    if (!prompt || typeof prompt !== 'string') {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid prompt parameter: must be a non-empty string'
      );
    }

      const result = await service.generateImage(prompt, style as string | undefined, resolution as string | undefined);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            imageUrl: result.imageUrl,
            prompt: result.prompt
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to generate image: ${(error as Error).message}`
    );
  }
});

// Error handling
server.onerror = (error) => console.error('[MCP Error]', error);

process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AI Asset Studio MCP server running on stdio');
}

run().catch(console.error);