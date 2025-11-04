# Seiling Auditor - Implementation Documentation

## Overview

Seiling Auditor is an AI-assisted smart contract auditing tool specifically designed for Sei blockchain contracts. This document details what has been implemented, how the system works, and the architecture decisions made during development.

## Implementation Status

### ✅ Completed Components

#### 1. Core Library Files

**Static Analyzer (`lib/staticAnalyzer.ts`)**
- Integrates with Docker containers for Slither and Mythril analysis
- Container names adapted: `seiling-auditor-slither`, `seiling-auditor-mythril`
- Features:
  - Runs Slither and Mythril in parallel for comprehensive analysis
  - Automatically detects and sets correct Solidity compiler version
  - Maps findings to SWC/CWE standards
  - Handles multi-file contracts
  - Cleans up temporary workspaces after analysis
- Error handling: Gracefully handles tool failures and continues with available results

**SeiScan Client (`lib/seiScanClient.ts`)**
- Designed for Sei blockchain contract verification and source retrieval
- Features:
  - `getContractSource()` - Retrieves single contract source code
  - `getVerifiedContract()` - Gets full verified contract with multi-file support
  - `getCombinedContractSource()` - Combines multiple source files
  - Removes comments from source code for cleaner analysis
  - Supports JSON-based multi-file format (Standard JSON Input)
  - Error handling for non-existent or unverified contracts
- API Integration: Configurable via `SEISCAN_API_URL` environment variable
- Note: Actual SeiScan API endpoints may need adjustment based on real API documentation

**Analysis Engine (`lib/analysisEngine.ts`)**
- Orchestrates the complete audit workflow
- Workflow:
  1. Validates and normalizes contract address
  2. Fetches source code from SeiScan
  3. Runs static analysis (Slither + Mythril)
  4. Performs AI-powered analysis (OpenAI or Anthropic)
  5. Validates and corrects line numbers in findings
  6. Classifies vulnerabilities by severity
  7. Generates comprehensive reports
  8. Saves to database
  9. Triggers webhook notifications
- Features:
  - Progress tracking with event emitters
  - AI integration for enhanced vulnerability detection
  - Line number validation and correction
  - Confidence scoring for findings
  - Comprehensive error handling
- Branding: Seiling Auditor for Seiling Buidlbox v2

**Report Generator (`lib/reportGenerator.ts`)**
- Generates both JSON and Markdown audit reports
- Features:
  - Severity breakdown (Critical, High, Medium, Low)
  - Overall risk assessment
  - SWC/CWE classification and references
  - Code snippets with line numbers
  - Remediation recommendations
  - Category summaries
- Output: Structured JSON for programmatic access, Markdown for human-readable reports

**Vulnerability Libraries**
- `lib/vulnerabilityCategories.ts` - Comprehensive vulnerability categories with detection patterns
- `lib/swcCweMap.ts` - Mapping between SWC IDs, CWE IDs, and their descriptions
- Both files are blockchain-agnostic and work with any Solidity contract

**Code Matching (`lib/codeMatching.ts`)**
- Validates and corrects line numbers in AI findings
- Fuzzy matching for code snippets
- Accuracy scoring for findings
- Ensures findings reference correct locations in source code

**Database Layer (`lib/database.ts`)**
- Complete database interaction layer
- SQLite-adapted for local development (PostgreSQL for production)
- Features:
  - Audit report management
  - Webhook configuration storage
  - Webhook delivery tracking
  - Statistics and reporting functions
  - Address normalization for case-insensitive matching

**Webhooks (`lib/webhooks.ts`)**
- Webhook notification system
- Features:
  - HMAC signature generation for security
  - Retry logic with configurable attempts
  - Event filtering by subscription
  - Delivery tracking and logging
  - Custom headers support

**Utility Files**
- `lib/addressUtils.ts` - Sei EVM address validation and normalization
- `lib/idUtils.ts` - UUID and CUID validation for job IDs

#### 2. API Routes

**POST/GET `/api/audit/start`**
- Starts a new audit job
- Supports both sync (streaming) and async modes
- Validates contract addresses using Sei address format
- Streams progress updates in real-time
- Error handling with detailed error messages

**GET `/api/audit/status/[jobId]`**
- Retrieves current status of an audit job
- Returns progress percentage, status, and error messages if any
- Includes report URL when completed

**GET `/api/audit/report/[jobId]`**
- Retrieves completed audit reports
- Returns JSON and Markdown formats
- Includes metadata (findings count, severity breakdown, processing time)
- Validates job ID format
- Proper error handling for non-existent or incomplete audits

**GET `/api/contracts/[address]`**
- Fetches contract information from SeiScan
- Supports detailed mode for multi-file contracts
- Returns source code, ABI, compiler info, constructor arguments
- Handles unverified contract errors gracefully

**POST/GET/DELETE `/api/webhook/configure`**
- Configures webhook URLs for audit notifications
- Validates webhook URLs (HTTPS required in production)
- Supports custom headers and retry configuration
- Event filtering (audit_completed, audit_failed, audit_started)
- User-based webhook management

#### 3. Database Schema

**Prisma Schema (`prisma/schema.prisma`)**
- Complete database schema
- Models:
  - `AuditReport` - Stores audit results with findings breakdown
  - `WebhookConfiguration` - User webhook settings
  - `WebhookDelivery` - Delivery tracking and history
- SQLite provider (can be switched to PostgreSQL for production)
- Proper indexes for performance
- Relationship constraints and cascading deletes

#### 4. Package Configuration

**package.json**
- Added all required dependencies:
  - `axios` - HTTP client for API calls
  - `uuid` - Unique ID generation
  - `react-markdown` - Markdown rendering
  - `react-syntax-highlighter` - Code syntax highlighting
  - `recharts` - Chart visualizations
  - `lucide-react` - Icon library
- Type definitions for TypeScript

## Architecture

### System Flow

```
1. User Request (Address/File)
   ↓
2. Address Validation (addressUtils.ts)
   ↓
3. Source Code Retrieval (seiScanClient.ts)
   ↓
4. Static Analysis (staticAnalyzer.ts)
   ├── Slither (Docker)
   └── Mythril (Docker)
   ↓
5. AI Analysis (analysisEngine.ts)
   ├── OpenAI or Anthropic
   └── Vulnerability Detection
   ↓
6. Line Number Validation (codeMatching.ts)
   ↓
7. Report Generation (reportGenerator.ts)
   ├── JSON Report
   └── Markdown Report
   ↓
8. Database Storage (database.ts)
   ↓
9. Webhook Notifications (webhooks.ts)
   ↓
10. Response to User
```

### Key Design Decisions

1. **Docker Integration**: Static analyzers run in Docker containers to avoid local installation requirements
2. **Async Processing**: Long-running audits use async job pattern with status polling
3. **Progress Tracking**: Real-time progress updates via event emitters and streaming responses
4. **Error Resilience**: Each component handles failures gracefully without breaking the entire workflow
5. **Blockchain Agnostic**: Core vulnerability detection works with any Solidity contract; only SeiScan integration is Sei-specific
6. **Extensibility**: Easy to add new static analyzers or AI providers

## Configuration

### Environment Variables

Required:
- `DATABASE_URL` - Database connection string (defaults to SQLite file)
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - For AI analysis
- `SEISCAN_API_URL` - SeiScan API endpoint (optional, has default)
- `SEISCAN_API_KEY` - SeiScan API key (optional, for rate limits)

Optional:
- `NEXT_PUBLIC_BASE_URL` - Base URL for webhook report links

### Docker Services

The auditor requires Docker services defined in `docker/services/docker-compose.auditor.yml`:
- `seiling-auditor-slither` - Slither static analyzer container
- `seiling-auditor-mythril` - Mythril static analyzer container (optional)

## Testing Considerations

### Unit Tests Needed
- Address validation and normalization
- ID validation
- Code matching algorithms
- SWC/CWE mapping

### Integration Tests Needed
- SeiScan API integration (with test contracts)
- Docker analyzer execution
- Database operations
- Webhook delivery

### End-to-End Tests Needed
- Complete audit workflow
- Batch audit processing
- Error scenarios (invalid addresses, unverified contracts)

## Known Limitations & TODOs

1. **SeiScan API**: The SeiScan client is implemented with a generic structure but may need adjustments based on actual API documentation
2. **UI Components**: Frontend components (upload UI, report viewer, charts) still need to be ported
3. **Batch Audit API**: `/api/audit/batch` route not yet implemented
4. **Docker Compose**: Full Docker Compose configuration with Slither/Mythril services needs expansion
5. **Error Handling**: Some edge cases in webhook updates/deletions need database function implementations
6. **Authentication**: Currently uses default user ID; proper auth integration needed
7. **Rate Limiting**: No rate limiting implemented for API endpoints
8. **Caching**: No caching layer for frequently accessed reports

## Next Steps

1. **UI Development**: Port React components for contract upload and report viewing
2. **Batch Processing**: Implement CSV-based batch audit functionality
3. **Docker Setup**: Complete Docker Compose configuration with proper volumes and networking
4. **API Testing**: Test SeiScan integration with real Sei contracts
5. **Documentation**: API documentation and user guides
6. **Monitoring**: Add logging and monitoring for production use

## Migration Notes

When moving from development to production:
1. Switch database provider from SQLite to PostgreSQL
2. Configure proper `DATABASE_URL` environment variable
3. Set up Docker services with proper networking
4. Configure HTTPS for webhooks
5. Set up proper authentication/authorization
6. Implement rate limiting
7. Add monitoring and alerting

## Additional Resources

- **Sei Documentation**: Sei blockchain and SeiScan API documentation
- **SWC Registry**: https://swcregistry.io/
- **CWE Database**: https://cwe.mitre.org/
- **Seiling Buidlbox v2**: Part of the Seiling Buidlbox v2 ecosystem

