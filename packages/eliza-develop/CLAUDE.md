# CLAUDE CODE CONFIGURATION - ELIZAOS PROJECT

This file contains project-specific configuration and preferences for Claude Code when working with the ElizaOS codebase.

---

## PROJECT INFORMATION

- **Working Directory:** `/Users/{user}/Documents/GitHub/eliza`
- **Git Repository:** Yes
- **Main Branch:** `develop`
- **Project Type:** TypeScript Monorepo
- **Package Manager:** `bun` (CRITICAL: Never use npm or pnpm)
- **Node Version:** 23.3.0
- **Monorepo Tools:** Turbo, Lerna

---

## MONOREPO ARCHITECTURE

ElizaOS is organized as a monorepo with the following key packages:

### Core Packages

- **`packages/core`** - `@elizaos/core` - Foundation runtime, types, agents, and database
- **`packages/cli`** - `@elizaos/cli` - Command-line interface and agent runtime
- **`packages/client`** - Frontend React GUI that displays through the CLI
- **`packages/app`** - Tauri-based desktop/mobile application
- **`packages/server`** - Server components and API
- **`packages/api-client`** - `@elizaos/api-client` - Type-safe API client for ElizaOS server

### Plugin & Template Packages

- **`packages/plugin-bootstrap`** - Default event handlers, actions, and providers
- **`packages/plugin-sql`** - DatabaseAdapter for Postgres and PGLite
- **`packages/plugin-starter`** - Template for creating new plugins
- **`packages/project-starter`** - Template for new projects
- **`packages/project-tee-starter`** - TEE (Trusted Execution Environment) project template

### Development & Documentation

- **`packages/autodoc`** - Documentation generation tools
- **`packages/docs`** - Official documentation (Docusaurus)
- **`packages/create-eliza`** - Project scaffolding tool

---

## COMMON COMMANDS

### Package Management & Building

```bash
bun install              # Install dependencies
bun run build            # Build all packages (excludes docs)
bun run build:docs       # Build documentation only
bun run build:cli        # Build CLI package specifically
bun run build:core       # Build core package specifically
bun run build:client     # Build client package specifically
```

### Development & Running

```bash
bun start                # Start CLI with agent runtime
bun run start:debug      # Start with debug logging
bun run start:app        # Start Tauri application
bun run dev              # Development mode with auto-rebuild

# Package-specific development
cd packages/cli && bun run dev          # CLI development mode
cd packages/client && bun run dev       # Client development mode
cd packages/core && bun run watch       # Core watch mode
```

### Testing

```bash
bun test                 # Run tests (excludes plugin-starter, docs, sql plugin)
bun run test:client      # Test client package only
bun run test:core        # Test core package only
bun run test:app         # Test app package only

# Package-specific testing (run from package directory)
cd packages/core && bun test           # Test core package directly
cd packages/cli && bun test            # Test CLI package directly
bun test src/specific-file.test.ts     # Run specific test file
```

### Code Quality

```bash
bun run lint             # Run linting and prettier
bun run format           # Format code with prettier
bun run format:check     # Check formatting without changes
bun run pre-commit       # Run pre-commit linting script

# Package-specific linting/formatting
cd packages/core && bun run lint
cd packages/cli && bun run format
```

### Database & Migration

```bash
bun run migrate          # Run database migrations
bun run migrate:generate # Generate new migrations
```

### Docker Operations

```bash
bun run docker:build    # Build Docker image
bun run docker:run      # Run Docker container
bun run docker:bash     # Access container shell
bun run docker:start    # Start container
bun run docker          # Build, run, and access container
```

### Release Management

```bash
bun run release         # Full release process
bun run release:alpha   # Release alpha version
```

---

## CRITICAL RULES

### Package Management

- **NEVER USE `npm` OR `pnpm`**
- **ALWAYS USE `bun` FOR ALL PACKAGE MANAGEMENT AND SCRIPT EXECUTION**
- **IF A COMMAND DOESN'T WORK:** Check `package.json` in the relevant package directory for correct script names
- Use `bun` for global installs: `bun install -g @elizaos/cli`

### Git & GitHub

- **ALWAYS USE `gh` CLI FOR GIT AND GITHUB OPERATIONS**
- Use `gh` commands for creating PRs, issues, releases, etc.
- **WHEN USER PROVIDES GITHUB WORKFLOW RUN LINK:** Use `gh run view <run-id>` and `gh run view <run-id> --log` to get workflow details and failure logs
- **NEVER ADD CO-AUTHOR CREDITS:** Do not include "Co-Authored-By: Claude" or similar co-authoring credits in commit messages or PR descriptions

### Development Branch Strategy

- **Base Branch:** `develop` (NOT `main`)
- **Create PRs against `develop` branch**
- **Main branch is used for releases only**

### ElizaOS CLI Usage

- **The `elizaos` CLI** is built from `packages/cli`
- **INTENDED FOR:** Production use by developers/users of the project
- **DO NOT USE THE `elizaos` CLI WITHIN THE `eliza` MONOREPO ITSELF**
- **The `elizaos` CLI is for external consumers, NOT internal monorepo development**
- **For monorepo development:** Use `bun` commands directly

### ElizaOS Test Command

The `elizaos test` command runs tests for ElizaOS projects and plugins:

```bash
elizaos test [path]           # Run all tests (component + e2e)
elizaos test -t component     # Run only component tests
elizaos test -t e2e          # Run only e2e tests
elizaos test --name "test"   # Filter tests by name
elizaos test --skip-build    # Skip building before tests
```

**Test Types:**

- **Component Tests:** Unit tests via `bun test` - test individual modules/components in isolation
- **E2E Tests:** Full integration tests via ElizaOS TestRunner - test complete agent runtime with server, database, and plugins

**Context Support:**

- Works in both monorepo packages and standalone projects created with `elizaos create`
- Automatically detects project type and adjusts paths accordingly
- For plugins: Creates default Eliza character as test agent
- For projects: Uses agents defined in project configuration

**Note:** The test command does NOT run Cypress or other UI tests - only ElizaOS-specific tests

---

## ARCHITECTURE PATTERNS

### Core Dependencies

- **Central Dependency:** Everything depends on `@elizaos/core` or `packages/core`
- **No Circular Dependencies:** Core cannot depend on other packages
- **Import Pattern:** Use `@elizaos/core` in package code, `packages/core` in internal references

### Key Abstractions

- **Channel → Room Mapping:** Discord/Twitter/GUI channels become "rooms"
- **Server → World Mapping:** Servers become "worlds" in agent memory
- **UUID System:** All IDs swizzled with agent's UUID into deterministic UUIDs

### Component Types

- **Actions:** Define agent capabilities and response mechanisms
- **Providers:** Supply dynamic contextual information (agent's "senses")
- **Evaluators:** Post-interaction cognitive processing
- **Tasks:** Manage deferred, scheduled, and interactive operations
- **Services:** Enable AI agents to interact with external platforms
- **Plugins:** Modular extensions for enhanced capabilities

### Database Architecture

- **ORM:** Drizzle ORM with IDatabaseAdapter interface
- **Adapters:** PGLite (local development), PostgreSQL (production)
- **Default:** PGLite for lightweight development

---

## DEVELOPMENT WORKFLOW

### Before Starting Any Task

1. **Understand requirement completely**
2. **Research all affected files and components**
3. **Create detailed implementation plan**
4. **Identify all possible risks and negative outcomes**

### Implementation Process

1. **Write comprehensive tests first when possible**
2. **Implement solution iteratively**
3. **Never use stubs or incomplete code**
4. **Continue until all stubs are replaced with working code**
5. **Test thoroughly - models hallucinate frequently**

### Testing Philosophy

- **Test Framework:** Bun's built-in test runner
- **E2E Tests:** Use actual runtime with real integrations
- **Unit Tests:** Use Bun test with standard primitives
- **Always verify tests pass before declaring changes correct**
- **First attempts are usually incorrect - test thoroughly**

---

## TASK COMPLETION VERIFICATION

### BEFORE CONSIDERING ANY TASK COMPLETE:

1. **CHECK IF ALL RELEVANT TESTS ARE PASSING**
2. **Run package-specific tests** if working on a specific package
3. **Run `bun test`** in monorepo root to test almost all packages
4. **Run `bun run build`** to ensure code builds successfully
5. **Run `bun run lint`** to check code formatting and style
6. **REFLECT:** Are all tests passing? Did you cut any corners? Are there any build issues?

### Testing Commands by Scope

```bash
# Full test suite (recommended)
bun test

# Package-specific testing (run from package directory)
cd packages/core && bun test
cd packages/cli && bun test
cd packages/client && bun test

# Run specific test files
bun test src/path/to/file.test.ts
bun test --watch                        # Watch mode for development

# Build verification
bun run build
```

---

## CODE STYLE GUIDELINES

### Language & Patterns

- **TypeScript with proper typing for all new code**
- **Use functional programming patterns; avoid classes**
- **Prefer iteration and modularization over code duplication**
- **Comprehensive error handling required**
- **Clear separation of concerns**

### Naming Conventions

- **Variables:** `camelCase` (e.g., `isLoading`, `hasError`)
- **Functions:** `camelCase` (e.g., `searchResults` vs `data`)
- **React Components:** `PascalCase` (e.g., `DashboardMenu`)
- **Props Interfaces:** `PascalCase` ending with `Props` (e.g., `DashboardMenuProps`)
- **File Names:** Match main export (e.g., `DashboardMenu.tsx`, `dashboardLogic.ts`)

### File Organization

- **Follow existing patterns in codebase**
- **Use descriptive variable and function names**
- **Comment complex logic**
- **Don't comment change notes**
- **Never omit code or add "// ..." as it risks breaking the codebase**

---

## ENVIRONMENT CONFIGURATION

### Required Environment Variables

```bash
# Model Provider (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Database (optional - defaults to PGLite)
POSTGRES_URL=your_postgres_connection_string

# Logging
LOG_LEVEL=info  # Options: fatal, error, warn, info, debug, trace
```

### Optional Service Keys

```bash
# Discord
DISCORD_APPLICATION_ID=
DISCORD_API_TOKEN=

# Telegram
TELEGRAM_BOT_TOKEN=

# Twitter
TWITTER_TARGET_USERS=
TWITTER_DRY_RUN=false

# Blockchain
EVM_PRIVATE_KEY=
SOLANA_PRIVATE_KEY=
```

---

## IMPORTANT FILES & LOCATIONS

### Configuration Files

- **`package.json`** - Root monorepo configuration
- **`turbo.json`** - Turbo build pipeline configuration
- **`lerna.json`** - Lerna publishing configuration
- **`tsconfig.json`** - TypeScript configuration
- **`.cursorrules`** - Cursor IDE development rules

### Key Source Files

- **`packages/core/src/types/index.ts`** - All core type definitions
- **`packages/core/src/runtime.ts`** - Main runtime implementation
- **`packages/cli/src/index.ts`** - CLI entry point
- **`.env.example`** - Environment variable template

### Documentation

- **`README.md`** - Main project documentation
- **`AGENTS.md`** - Comprehensive agent documentation (45k+ tokens)
- **`CHANGELOG.md`** - Version history
- **`scripts/dev-instructions.md`** - Developer context and guidance

---

## DEVELOPMENT PRINCIPLES

### Flow - Always Plan First

- **Bug Fixes:** First identify the bug, research ALL related files, create complete change plan
- **Impact Analysis:** Identify all possible errors and negative outcomes from changes
- **Documentation:** Create thorough implementation plan BEFORE writing any code
- **Risk Assessment:** Thoroughly outline all risks and offer multiple approaches

### No Stubs or Incomplete Code

- **Never** use stubs, fake code, or incomplete implementations
- **Always** continue writing until all stubs are replaced with finished, working code
- **No POCs:** Never deliver proof-of-concepts - only finished, detailed code
- **Iteration:** Work on files until they are perfect, testing and fixing until all tests pass

### Test-Driven Development

- Models hallucinate frequently - thorough testing is critical
- Verify tests are complete and passing before declaring changes correct
- First attempts are usually incorrect - test thoroughly
- Write tests before implementation when possible

---

## IMPORTANT NOTES

### Memory System

- Each agent has a fully separate and unique set of UUIDs to describe the same world, rooms, etc
- Uses deterministic UUID generation
- All IDs swizzled with agent's UUID for consistency

### Plugin Architecture

- All components integrate through the runtime
- Services are the state management layer
- Actions drive agent behavior
- Providers supply context
- Evaluators enable learning and reflection
- HTTP routes with "public" exposed as HTML tabs (must have "name" property)

### Compatibility

- Plugin compatibility through `/specs` (currently defaulting to v2)
- Maintain backwards compatibility in changes
- Consider migration paths for proposed changes

---

## TROUBLESHOOTING

### Common Issues

1. **Build Failures:** Check TypeScript errors with `bun run build`
2. **Test Failures:** Run `bun test` and check individual package tests
3. **Import Errors:** Verify correct use of `@elizaos/core` vs `packages/core`
4. **Environment Issues:** Check `.env` file against `.env.example`

### Performance Considerations

- Agent perspective is key for all abstractions
- Services maintain system state
- Access pattern: `getService(serviceName)`
- Services can call each other, actions can access services

### Getting Help

- Check existing documentation in `packages/docs/`
- Review `.cursorrules` for architectural guidance
- Look at existing patterns in similar packages
- Test changes thoroughly before considering complete

---

_This configuration file should be referenced at the start of any ElizaOS development session to ensure proper setup and adherence to project standards._
