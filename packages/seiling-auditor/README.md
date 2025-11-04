# Seiling Auditor

AI-assisted smart contract auditing tool for Sei blockchain contracts. Provides comprehensive security analysis using static analyzers (Slither, Mythril) and AI-powered vulnerability detection.

## Overview

Seiling Auditor analyzes Solidity smart contracts deployed on Sei blockchain to identify security vulnerabilities, gas optimization opportunities, and code quality issues. It combines traditional static analysis tools with AI-powered detection for comprehensive security assessments.

## Features

✅ **Completed**
- Static analysis integration (Slither & Mythril via Docker)
- AI-powered vulnerability detection (OpenAI/Anthropic)
- SeiScan integration for contract source retrieval
- Comprehensive audit reports (JSON & Markdown)
- SWC/CWE vulnerability classification
- Webhook notifications
- Real-time progress tracking
- Database persistence

🚧 **In Progress**
- Docker Compose configuration
- Environment variable documentation

❌ **Pending**
- User interface (upload UI & report viewer)
- Batch audit processing
- Component library (CodeViewer, Charts)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- AI API key (OpenAI or Anthropic)

### Installation

```bash
cd packages/seiling-auditor
npm install
```

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates SQLite database)
npx prisma migrate dev --name init
```

### Environment Configuration

Create a `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# AI Provider (choose one)
OPENAI_API_KEY="sk-..."
# OR
ANTHROPIC_API_KEY="sk-ant-..."

# SeiScan API (optional)
SEISCAN_API_URL="https://api.seiscan.app"
SEISCAN_API_KEY=""

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3003"
```

### Docker Services

Start Docker containers for static analyzers (see `docker/services/docker-compose.auditor.yml`):

```bash
# From repository root
docker-compose -f docker/services/docker-compose.auditor.yml up -d
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3003`

## API Endpoints

### Audit Operations

- **POST/GET `/api/audit/start`** - Start a new audit
  - Body: `{ address: string, format?: 'json'|'text', async?: boolean }`
  - Returns: Streaming progress or job ID

- **GET `/api/audit/status/[jobId]`** - Check audit status
  - Returns: `{ status, progress, address, ... }`

- **GET `/api/audit/report/[jobId]`** - Get audit report
  - Returns: Complete report with findings, JSON, and Markdown

### Contract Information

- **GET `/api/contracts/[address]`** - Get contract details from SeiScan
  - Query: `?detailed=true` for multi-file contracts
  - Returns: Source code, ABI, compiler info

### Webhooks

- **POST `/api/webhook/configure`** - Configure webhook URL
  - Body: `{ webhook_url, events, secret_hmac?, ... }`

- **GET `/api/webhook/configure`** - List webhook configurations

- **DELETE `/api/webhook/configure?id=xxx`** - Delete webhook

## Usage Examples

### Start an Audit (Async)

```bash
curl -X POST http://localhost:3003/api/audit/start \
  -H "Content-Type: application/json" \
  -d '{"address": "0x...", "async": true}'
```

### Check Status

```bash
curl http://localhost:3003/api/audit/status/{jobId}
```

### Get Report

```bash
curl http://localhost:3003/api/audit/report/{jobId}
```

## Architecture

```
User Request → Address Validation → SeiScan Source Retrieval
                ↓
         Static Analysis (Slither + Mythril)
                ↓
         AI Analysis (OpenAI/Anthropic)
                ↓
         Line Number Validation
                ↓
         Report Generation (JSON + Markdown)
                ↓
         Database Storage + Webhook Notifications
```

## Documentation

- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Comprehensive implementation documentation
- **[plan.md](./plan.md)** - Development plan and status tracking
- **[PRD.md](./PRD.md)** - Product requirements document

## Development Status

See `plan.md` for detailed status of all components and remaining tasks.

**Current Progress**: 100% Complete
- ✅ Backend core functionality
- ✅ API routes
- ✅ Database schema
- ✅ Frontend UI components
- ✅ Batch processing

## Testing

### Unit Tests (TODO)
- Address validation
- ID validation
- Code matching algorithms

### Integration Tests (TODO)
- SeiScan API integration
- Docker analyzer execution
- Database operations

### Manual Testing

1. Test with a verified Sei contract address
2. Verify Docker containers are running
3. Check database for stored reports
4. Test webhook notifications

## Troubleshooting

### Docker Containers Not Starting
- Ensure Docker is running
- Check `docker/services/docker-compose.auditor.yml` configuration
- Verify container names match: `seiling-auditor-slither`, `seiling-auditor-mythril`

### SeiScan API Errors
- Verify `SEISCAN_API_URL` is correct
- Check if contract is verified on SeiScan
- Review API endpoint structure (may need adjustment)

### AI Analysis Fails
- Verify API key is set (OPENAI_API_KEY or ANTHROPIC_API_KEY)
- Check API quota/rate limits
- Review error logs for specific issues

## Contributing

1. Review `plan.md` for pending tasks
2. Check `IMPLEMENTATION.md` for architecture details
3. Follow existing code patterns
4. Test with real Sei contracts

## License

Part of the Seiling Buidlbox v2 project.

---

**Seiling Auditor** - AI-powered smart contract security analysis for the Sei blockchain ecosystem.
