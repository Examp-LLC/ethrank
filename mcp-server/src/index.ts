#!/usr/bin/env node

/**
 * ETHRank MCP Server
 * 
 * Model Context Protocol server for ETHRank - The Ethereum Leaderboard
 * Provides tools and resources for querying Ethereum address scores and rankings.
 * 
 * Copyright 2025 Examp, LLC
 * Licensed under GPL-3.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';

const API_BASE_URL = process.env.ETHRANK_API_URL || 'https://ethrank.io/api';
const CURRENT_SEASON = 5;

interface AddressScore {
  score: number;
  rank: number;
  progress: string[];
  activeSince?: string;
  spentOnGas?: string;
  totalTransactions?: number;
}

interface LeaderboardEntry {
  address: string;
  score: number;
  name: string;
  imageUrl: string;
  rank: number;
}

/**
 * Fetch address score and rank from ETHRank API
 */
async function getAddressScore(address: string, season: number = CURRENT_SEASON, extended: boolean = false): Promise<AddressScore> {
  const url = `${API_BASE_URL}/address/${address}?season=${season}${extended ? '&extended=true' : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch address score: ${response.statusText}`
    );
  }
  
  return await response.json() as AddressScore;
}

/**
 * Calculate score for an address (triggers new calculation)
 */
async function calculateAddressScore(address: string, season: number = CURRENT_SEASON): Promise<any> {
  const url = `${API_BASE_URL}/calculate-score/${address}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address, season }),
  });
  
  if (!response.ok) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to calculate score: ${response.statusText}`
    );
  }
  
  return await response.json();
}

/**
 * Fetch ENS labels for an address
 */
async function getAddressLabels(address: string): Promise<any> {
  const url = `${API_BASE_URL}/labels/${address}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch address labels: ${response.statusText}`
    );
  }
  
  return await response.json();
}

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: 'ethrank-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_address_score',
        description: 'Get the ETHRank score and ranking for an Ethereum address. Returns score, rank, and progress details for the specified season.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Ethereum address (0x...)',
            },
            season: {
              type: 'number',
              description: 'ETHRank season number (1-5, default: 5)',
              default: CURRENT_SEASON,
            },
            extended: {
              type: 'boolean',
              description: 'Include extended information (activeSince, spentOnGas, totalTransactions)',
              default: false,
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'calculate_address_score',
        description: 'Calculate or recalculate the ETHRank score for an address. This triggers a fresh calculation based on on-chain activity. Use when you need up-to-date scoring.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Ethereum address (0x...)',
            },
            season: {
              type: 'number',
              description: 'ETHRank season number (1-5, default: 5)',
              default: CURRENT_SEASON,
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'get_address_labels',
        description: 'Get ENS names and labels associated with an Ethereum address.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Ethereum address (0x...)',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'compare_addresses',
        description: 'Compare the scores and rankings of multiple Ethereum addresses for a given season.',
        inputSchema: {
          type: 'object',
          properties: {
            addresses: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of Ethereum addresses to compare',
              minItems: 2,
              maxItems: 10,
            },
            season: {
              type: 'number',
              description: 'ETHRank season number (1-5, default: 5)',
              default: CURRENT_SEASON,
            },
          },
          required: ['addresses'],
        },
      },
    ],
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_address_score': {
        const { address, season = CURRENT_SEASON, extended = false } = args as {
          address: string;
          season?: number;
          extended?: boolean;
        };
        
        const score = await getAddressScore(address, season, extended);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(score, null, 2),
            },
          ],
        };
      }

      case 'calculate_address_score': {
        const { address, season = CURRENT_SEASON } = args as {
          address: string;
          season?: number;
        };
        
        const result = await calculateAddressScore(address, season);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_address_labels': {
        const { address } = args as { address: string };
        
        const labels = await getAddressLabels(address);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(labels, null, 2),
            },
          ],
        };
      }

      case 'compare_addresses': {
        const { addresses, season = CURRENT_SEASON } = args as {
          addresses: string[];
          season?: number;
        };
        
        // Fetch scores for all addresses in parallel
        const scores = await Promise.all(
          addresses.map(async (address) => {
            try {
              const score = await getAddressScore(address, season, true);
              return {
                address,
                ...score,
              };
            } catch (error) {
              return {
                address,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );
        
        // Sort by rank (lower is better)
        const sortedScores = scores
          .filter((s) => !('error' in s))
          .sort((a, b) => (a as any).rank - (b as any).rank);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  comparison: sortedScores,
                  errors: scores.filter((s) => 'error' in s),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

/**
 * Handler for listing available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'ethrank://seasons',
        name: 'ETHRank Seasons',
        description: 'Information about all ETHRank seasons and their scoring criteria',
        mimeType: 'application/json',
      },
      {
        uri: 'ethrank://season/current',
        name: 'Current Season Info',
        description: 'Details about the current ETHRank season',
        mimeType: 'application/json',
      },
      {
        uri: 'ethrank://about',
        name: 'About ETHRank',
        description: 'General information about the ETHRank leaderboard',
        mimeType: 'text/plain',
      },
    ],
  };
});

/**
 * Handler for reading resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case 'ethrank://seasons':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                seasons: [
                  {
                    number: 1,
                    name: 'Season One',
                    description: 'The inaugural season of ETHRank',
                    startDate: '2022-01-01',
                    active: false,
                  },
                  {
                    number: 2,
                    name: 'Season Two',
                    description: 'Expanded scoring with new protocols',
                    startDate: '2022-06-01',
                    active: false,
                  },
                  {
                    number: 3,
                    name: 'Season Three',
                    description: 'Enhanced metrics and community features',
                    startDate: '2023-01-01',
                    active: false,
                  },
                  {
                    number: 4,
                    name: 'Season Four',
                    description: 'New scoring algorithms and integrations',
                    startDate: '2023-08-01',
                    active: false,
                  },
                  {
                    number: 5,
                    name: 'Season Five',
                    description: 'Current season with 23 new projects',
                    startDate: '2024-04-01',
                    active: true,
                  },
                ],
              },
              null,
              2
            ),
          },
        ],
      };

    case 'ethrank://season/current':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                season: CURRENT_SEASON,
                name: 'Season Five',
                description: 'Current season with 23 new projects',
                features: [
                  'Enhanced scoring algorithm',
                  'New protocol integrations',
                  'Achievement badges',
                  'Community features',
                ],
                active: true,
              },
              null,
              2
            ),
          },
        ],
      };

    case 'ethrank://about':
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: `ETHRank - The Ethereum Leaderboard

ETHRank is a gamified leaderboard that ranks Ethereum addresses based on their on-chain activity and participation in various DeFi protocols, NFT platforms, and other Ethereum ecosystem projects.

How It Works:
- Addresses are scored based on their interactions with curated Ethereum projects
- Each season features different scoring criteria and included projects
- Scores are calculated by analyzing on-chain transaction data
- Rankings are updated based on cumulative scores

Features:
- Real-time address scoring
- Historical season data
- Achievement badges for top performers
- ENS name integration
- Detailed progress tracking

Website: https://ethrank.io
GitHub: https://github.com/Examp-LLC/ethrank
License: GPL-3.0

Copyright 2025 Examp, LLC`,
          },
        ],
      };

    default:
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Unknown resource: ${uri}`
      );
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ETHRank MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

