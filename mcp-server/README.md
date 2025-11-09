# ETHRank MCP Server

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Model Context Protocol (MCP) server for [ETHRank](https://ethrank.io) - The Ethereum Leaderboard. This server enables AI assistants and other MCP clients to query Ethereum address scores, rankings, and leaderboard data.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard that enables AI assistants to securely connect to external data sources and tools. MCP servers expose resources (data) and tools (functions) that AI assistants can use to provide better, more contextual responses.

## Features

### Tools

The ETHRank MCP server provides the following tools:

1. **get_address_score** - Get the score and ranking for an Ethereum address
   - Parameters: `address` (required), `season` (optional, 1-5), `extended` (optional boolean)
   - Returns: score, rank, progress details, and optionally gas spent, transactions, and active since date

2. **calculate_address_score** - Trigger a fresh score calculation for an address
   - Parameters: `address` (required), `season` (optional, 1-5)
   - Returns: newly calculated score and rank with full details

3. **get_address_labels** - Get ENS names and labels for an address
   - Parameters: `address` (required)
   - Returns: ENS names and associated labels

4. **compare_addresses** - Compare scores of multiple addresses
   - Parameters: `addresses` (array of 2-10 addresses), `season` (optional, 1-5)
   - Returns: sorted comparison of addresses with their scores and ranks

### Resources

The server exposes the following resources:

1. **ethrank://seasons** - Information about all ETHRank seasons
2. **ethrank://season/current** - Details about the current season
3. **ethrank://about** - General information about ETHRank

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Install from npm (coming soon)

```bash
npm install -g @ethrank/mcp-server
```

### Install from source

```bash
cd mcp-server
npm install
npm run build
```

## Usage

### Using with Claude Desktop

Add the server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ethrank": {
      "command": "npx",
      "args": ["-y", "@ethrank/mcp-server"]
    }
  }
}
```

Or if running from source:

```json
{
  "mcpServers": {
    "ethrank": {
      "command": "node",
      "args": ["/path/to/ethrank/mcp-server/dist/index.js"]
    }
  }
}
```

### Using with Other MCP Clients

The server runs on stdio and can be integrated with any MCP-compatible client:

```bash
# Run the server
node dist/index.js

# Or if installed globally
ethrank-mcp
```

### Environment Variables

- `ETHRANK_API_URL` - Base URL for ETHRank API (default: `https://ethrank.io/api`)

## Examples

### Example 1: Get Address Score

```
User: "What's the ETHRank score for vitalik.eth?"

Assistant uses get_address_score tool:
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "season": 5
}

Response:
{
  "score": 850,
  "rank": 42,
  "progress": ["gitcoin", "uniswap", "ens", ...],
  "activeSince": "2015-07-30",
  "spentOnGas": "125.3",
  "totalTransactions": 15420
}
```

### Example 2: Compare Multiple Addresses

```
User: "Compare the ETHRank scores of vitalik.eth and other.eth"

Assistant uses compare_addresses tool:
{
  "addresses": [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "0x..."
  ],
  "season": 5
}

Response:
{
  "comparison": [
    { "address": "0x...", "score": 950, "rank": 10, ... },
    { "address": "0x...", "score": 850, "rank": 42, ... }
  ]
}
```

### Example 3: Access Season Information

```
User: "Tell me about ETHRank seasons"

Assistant reads ethrank://seasons resource:
{
  "seasons": [
    {
      "number": 5,
      "name": "Season Five",
      "description": "Current season with 23 new projects",
      "active": true
    },
    ...
  ]
}
```

## API Reference

### Tools

#### get_address_score

Retrieve the ETHRank score and ranking for an Ethereum address.

**Parameters:**
- `address` (string, required): Ethereum address (0x...)
- `season` (number, optional): Season number (1-5, default: 5)
- `extended` (boolean, optional): Include extended info (default: false)

**Returns:**
```typescript
{
  score: number;
  rank: number;
  progress: string[];
  activeSince?: string;
  spentOnGas?: string;
  totalTransactions?: number;
}
```

#### calculate_address_score

Trigger a fresh calculation of an address's score.

**Parameters:**
- `address` (string, required): Ethereum address (0x...)
- `season` (number, optional): Season number (1-5, default: 5)

**Returns:**
```typescript
{
  status: 'completed' | 'error';
  data?: {
    address: string;
    score: number;
    rank: number;
    progress: string[];
    name: string;
    totalTransactions: number;
    spentOnGas: string;
    activeSince: string | null;
  };
  error?: string;
}
```

#### get_address_labels

Get ENS names and labels for an Ethereum address.

**Parameters:**
- `address` (string, required): Ethereum address (0x...)

**Returns:**
```typescript
{
  names: string[];
  labels: string[];
}
```

#### compare_addresses

Compare multiple addresses' scores and rankings.

**Parameters:**
- `addresses` (string[], required): Array of Ethereum addresses (2-10)
- `season` (number, optional): Season number (1-5, default: 5)

**Returns:**
```typescript
{
  comparison: Array<{
    address: string;
    score: number;
    rank: number;
    progress: string[];
    // ... other fields
  }>;
  errors: Array<{
    address: string;
    error: string;
  }>;
}
```

### Resources

All resources return JSON or plain text content:

- `ethrank://seasons` - List of all seasons with metadata
- `ethrank://season/current` - Current season details
- `ethrank://about` - About ETHRank and how it works

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This runs TypeScript compiler in watch mode.

### Testing

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Hosting

The MCP server can be hosted and accessed via:

1. **Direct Installation** - Install via npm/npx
2. **Remote Server** - Run on a server and connect via stdio transport
3. **Docker** - Package in a container for easy deployment

For production hosting on ethrank.io, the server can be run as a systemd service or containerized application.

## Contributing

Contributions are welcome! Please see the main [ETHRank repository](https://github.com/Examp-LLC/ethrank) for contribution guidelines.

## License

GPL-3.0 License - see [LICENSE](../LICENSE) for details.

## Links

- Website: https://ethrank.io
- GitHub: https://github.com/Examp-LLC/ethrank
- Discord: https://discord.com/invite/CNVQWw6KFU
- Twitter: https://twitter.com/eth_rank

## Support

For issues and questions:
- Open an issue on [GitHub](https://github.com/Examp-LLC/ethrank/issues)
- Join our [Discord](https://discord.com/invite/CNVQWw6KFU)
- Follow us on [Twitter](https://twitter.com/eth_rank)

---

Built with ❤️ by [Examp, LLC](https://examp.io)

