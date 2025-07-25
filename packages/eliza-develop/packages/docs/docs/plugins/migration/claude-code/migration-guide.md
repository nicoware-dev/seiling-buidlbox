# ElizaOS Plugin Migration Guide - v1.x

> **Important**: This guide provides a general framework for migrating ElizaOS plugins to v1.x. Specific configurations will vary based on your plugin's functionality.

## Step 1: Create Version Branch

Create a new branch for the 1.x version while preserving the main branch for backwards compatibility:

```bash
git checkout -b 1.x
```

> **Note**: This branch will serve as your new 1.x version branch, keeping `main` intact for legacy support.

---

## Step 2: Remove Deprecated Files

Clean up deprecated tooling and configuration files:

### Files to Remove:

- **`biome.json`** - Deprecated linter configuration
- **`vitest.config.ts`** - Replaced by Bun test runner
- **Lock files** - Any `lock.json` or `yml.lock` files

### Quick Cleanup Commands:

```bash
rm -rf vitest.config.ts
rm -rf biome.json
rm -f *.lock.json *.yml.lock
```

> **Why?** The ElizaOS ecosystem has standardized on:
>
> - **Bun's built-in test runner** (replacing Vitest) - All plugins must now use `bun test`
> - **Prettier** for code formatting (replacing Biome)
>
> This ensures consistency across all ElizaOS plugins and simplifies the development toolchain.

---

## Step 3: Update package.json

### 3.1 Version Update

```json
"version": "1.0.0"
```

### 3.1.5 Package Name Update

Check if your package name contains the old namespace and update it:

```json
// OLD (incorrect):
"name": "@elizaos-plugins/plugin-bnb"

// NEW (correct):
"name": "@elizaos/plugin-bnb"
```

> **Important**: If your package name starts with `@elizaos-plugins/`, remove the "s" from "plugins" to change it to `@elizaos/`. This is the correct namespace for all ElizaOS plugins in v1.x.

### 3.2 Dependencies

- **Remove**: `biome`, `vitest` (if present)
- **Add**: Core and plugin-specific dependencies

### 3.3 Dev Dependencies

Add the following development dependencies:

```json
"devDependencies": {
  "tsup": "8.3.5",
  "prettier": "^3.0.0",
  "bun": "^1.2.15",          // REQUIRED: All plugins now use Bun test runner
  "@types/bun": "latest",     // REQUIRED: TypeScript types for Bun
  "typescript": "^5.0.0"
}
```

> **Important**: `bun` and `@types/bun` are **REQUIRED** dependencies for all plugins in v1.x. The ElizaOS ecosystem has standardized on Bun's built-in test runner, replacing Vitest. Without these dependencies, your tests will not run properly.

### 3.4 Scripts Section

Replace your existing scripts with:

```json
"scripts": {
  "build": "tsup",
  "dev": "tsup --watch",
  "lint": "prettier --write ./src",
  "clean": "rm -rf dist .turbo node_modules .turbo-tsconfig.json tsconfig.tsbuildinfo",
  "format": "prettier --write ./src",
  "format:check": "prettier --check ./src",
  "test": "bun test",                    // Uses Bun's built-in test runner
  "test:watch": "bun test --watch",      // Watch mode for development
  "test:coverage": "bun test --coverage" // Coverage reports with Bun
}
```

> **Note**: All test scripts now use Bun's built-in test runner. Make sure you have `bun` and `@types/bun` installed as dev dependencies (see section 3.3).

### 3.5 Publish Configuration

Add the following to enable public npm publishing:

```json
"publishConfig": {
  "access": "public"
}
```

### 3.6 Agent Configuration

Replace your `agentConfig` with the new structure:

```json
"agentConfig": {
  "pluginType": "elizaos:plugin:1.0.0",
  "pluginParameters": {
    "YOUR_PARAMETER_NAME": {
      "type": "string",
      "description": "Description of what this parameter does",
      "required": true,
      "sensitive": true
    }
  }
}
```

> **Note**: Replace `YOUR_PARAMETER_NAME` with your plugin's specific configuration parameters. Common types include API keys, endpoints, credentials, etc.

### 3.7 Dependencies

Add your plugin-specific dependencies:

```json
"dependencies": {
  "@elizaos/core": "latest",
  // Add your plugin-specific dependencies here
}
```

---

## Step 4: TypeScript Configuration

### 4.1 Update `tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  tsconfig: './tsconfig.build.json', // Use build-specific tsconfig
  sourcemap: true,
  clean: true,
  format: ['esm'], // ESM output format
  dts: true,
  external: ['dotenv', 'fs', 'path', 'https', 'http', '@elizaos/core', 'zod'],
});
```

### 4.2 Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": "./",
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": true,
    "declaration": true,
    "emitDeclarationOnly": true,
    "resolveJsonModule": true,
    "moduleDetection": "force",
    "allowArbitraryExtensions": true,
    "types": ["bun"]
  },
  "include": ["src/**/*.ts"]
}
```

### 4.3 Create `tsconfig.build.json`

Create a new file with build-specific TypeScript configuration:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "sourceMap": true,
    "inlineSources": true,
    "declaration": true,
    "emitDeclarationOnly": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

---

## Step 5: Verify Build Process

Clean everything and test the new setup:

```bash
# Clean all build artifacts and dependencies
rm -rf dist node_modules .turbo

# Install dependencies with Bun
bun install

# Build the project
bun run build
```

### Expected Results:

- Dependencies install without errors
- Build completes successfully
- `dist` folder contains compiled output
- TypeScript declarations are generated

> **Next Steps**: After verifying the build, proceed to Step 6 to migrate your actions and providers to handle the breaking API changes.

## Step 6: Migrate Actions & Providers

### 6.1 Import Changes

Update your imports in action files:

```typescript
// Remove these imports:
import { generateObject, composeContext } from '@elizaos/core';

// Add/update these imports:
import {
  composePromptFromState,
  parseKeyValueXml,
  ModelType, // Note: ModelType replaces ModelClass
} from '@elizaos/core';
```

### 6.2 State Handling Migration

Replace the state initialization and update pattern:

```typescript
// OLD Pattern:
let currentState = state;
if (!currentState) {
  currentState = (await runtime.composeState(message)) as State;
} else {
  currentState = await runtime.updateRecentMessageState(currentState);
}

// NEW Pattern:
let currentState = state;
if (!currentState) {
  currentState = await runtime.composeState(message);
} else {
  currentState = await runtime.composeState(message, ['RECENT_MESSAGES']);
}
```

### 6.3 Context/Prompt Generation

Replace `composeContext` with `composePromptFromState`:

```typescript
// OLD:
const context = composeContext({
  state: currentState,
  template: yourTemplate,
});

// NEW:
const prompt = composePromptFromState({
  state: currentState,
  template: yourTemplate,
});
```

### 6.4 Template Migration - JSON to XML Format

#### Update Template Content:

Templates should be updated from requesting JSON responses to XML format for use with `parseKeyValueXml`.

```typescript
// OLD Template Pattern (JSON):
const template = `Respond with a JSON markdown block containing only the extracted values.

Example response for a new token:
\`\`\`json
{
    "name": "Test Token",
    "symbol": "TEST"
}
\`\`\`

Given the recent messages, extract the following information:
- Name
- Symbol`;

// NEW Template Pattern (XML):
const template = `Respond with an XML block containing only the extracted values. Use key-value pairs.

Example response for a new token:
<response>
    <name>Test Token</name>
    <symbol>TEST</symbol>
</response>

## Recent Messages

{{recentMessages}}

Given the recent messages, extract the following information about the requested token creation:
- Name
- Symbol

Respond with an XML block containing only the extracted values.`;
```

### 6.5 Content Generation Migration

Replace `generateObject` with `runtime.useModel`:

```typescript
// OLD Pattern:
const content = await generateObject({
  runtime,
  context: context,
  modelClass: ModelClass.SMALL,
});

// NEW Pattern:
const result = await runtime.useModel(ModelType.TEXT_SMALL, {
  prompt,
});

const content = parseKeyValueXml(result);
```

**Important Changes:**

- `ModelClass.SMALL` → `ModelType.TEXT_SMALL`
- First parameter is the model type enum value
- Second parameter is an object with `prompt` and optional `stopSequences`
- Parse the result with `parseKeyValueXml` which extracts key-value pairs from XML responses

### 6.6 Content Interface and Validation

#### Define Content Interface:

```typescript
export interface YourActionContent extends Content {
  // Define your required fields
  name: string;
  symbol: string;
}
```

#### Create Validation Function:

```typescript
function isYourActionContent(_runtime: IAgentRuntime, content: any): content is YourActionContent {
  elizaLogger.debug('Content for validation', content);
  return typeof content.name === 'string' && typeof content.symbol === 'string';
}
```

### 6.7 Handler Pattern Updates

Complete handler migration example:

```typescript
handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
) => {
    elizaLogger.log("Starting YOUR_ACTION handler...");

    // 1. Initialize or update state
    let currentState = state;
    if (!currentState) {
        currentState = await runtime.composeState(message);
    } else {
        currentState = await runtime.composeState(message, [
            "RECENT_MESSAGES",
        ]);
    }

    // 2. Compose prompt from state
    const prompt = composePromptFromState({
        state: currentState,
        template: yourTemplate,
    });

    // 3. Generate content using the model
    const result = await runtime.useModel(ModelType.TEXT_SMALL, {
        prompt,
        stopSequences: [],
    });

    // 4. Parse the result
    const content = parseKeyValueXml(result);

    elizaLogger.debug("Parsed content:", content);

    // 5. Validate content
    if (!isYourActionContent(runtime, content)) {
        elizaLogger.error("Invalid content for YOUR_ACTION action.");
        callback?.({
            text: "Unable to process request. Invalid content provided.",
            content: { error: "Invalid content" },
        });
        return false;
    }

    // 6. Execute your action logic
    try {
        // Your action implementation here
        const result = await yourActionLogic(runtime, content);

        callback?.({
            text: `Success message with ${content.name}`,
            content: result,
        });
        return true;
    } catch (error) {
        elizaLogger.error("Action failed:", error);
        callback?.({
            text: "Action failed. Please try again.",
            content: { error: error.message },
        });
        return false;
    }
},
```

### 6.8 Action Examples Structure

The action examples structure remains largely the same, but ensure they follow this pattern:

```typescript
examples: [
    [
        {
            user: "{{name1}}", // Note: "user" instead of "name" for user messages
            content: {
                text: "User input text here",
            },
        },
        {
            name: "{{name2}}", // Agent response uses "name"
            content: {
                action: "YOUR_ACTION_NAME",
                // Include the expected parsed fields
                name: "Expected Name",
                symbol: "Expected Symbol",
            },
        },
    ],
] as ActionExample[][],
```

### Important Migration Notes:

- Update templates to request XML format instead of JSON
- The `parseKeyValueXml` function parses XML responses into key-value objects
- Always include error handling and validation
- Use `elizaLogger` for debugging
- The callback pattern remains the same for success/error responses
- Model types have changed from `ModelClass` to `ModelType` enum

## Step 7: Migrate Providers

### 7.1 Provider Interface Changes

The Provider interface has been significantly enhanced with new required and optional properties:

```typescript
// OLD Provider Interface:
export interface Provider {
  get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<any>;
}

// NEW Provider Interface:
interface Provider {
  name: string; // REQUIRED: Unique identifier for the provider
  description?: string; // Optional: Description of what the provider does
  dynamic?: boolean; // Optional: Whether the provider is dynamic
  position?: number; // Optional: Position in provider list (+ or -)
  private?: boolean; // Optional: Whether provider is private (not shown in list)
  get: (
    runtime: IAgentRuntime,
    message: Memory,
    state: State // Note: state is no longer optional
  ) => Promise<ProviderResult>; // Returns ProviderResult instead of any
}
```

### 7.2 ProviderResult Interface

The `get` method must now return a `ProviderResult` object instead of `any`:

```typescript
interface ProviderResult {
  values?: {
    [key: string]: any;
  };
  data?: {
    [key: string]: any;
  };
  text?: string;
}
```

### 7.3 Migration Steps

#### Step 1: Add Required `name` Property

Every provider must have a unique `name` property:

```typescript
// OLD:
const myProvider: Provider = {
  get: async (runtime, message, state) => {
    // ...
  },
};

// NEW:
const myProvider: Provider = {
  name: 'myProvider', // REQUIRED
  get: async (runtime, message, state) => {
    // ...
  },
};
```

#### Step 2: Update Return Type

Change your return statements to return a `ProviderResult` object:

```typescript
// OLD:
return 'Some text response';
// or
return { someData: 'value' };

// NEW:
return {
  text: 'Some text response',
};
// or
return {
  data: { someData: 'value' },
};
// or
return {
  text: 'Some text',
  values: { key1: 'value1' },
  data: { complex: { nested: 'data' } },
};
```

#### Step 3: Handle Non-Optional State

The `state` parameter is no longer optional. Update your function signature:

```typescript
// OLD:
get: async (runtime, message, state?) => {
  if (!state) {
    // handle missing state
  }
};

// NEW:
get: async (runtime, message, state) => {
  // state is always provided
};
```

### 7.4 Complete Migration Examples

#### Example 1: Simple Text Provider

```typescript
// OLD Implementation:
const simpleProvider: Provider = {
  get: async (runtime, message, state?) => {
    return 'Hello from provider';
  },
};

// NEW Implementation:
const simpleProvider: Provider = {
  name: 'simpleProvider',
  description: 'A simple text provider',
  get: async (runtime, message, state) => {
    return {
      text: 'Hello from provider',
    };
  },
};
```

#### Example 2: Data Provider

```typescript
// OLD Implementation:
const dataProvider: Provider = {
  get: async (runtime, message, state?) => {
    const data = await fetchSomeData();
    return data;
  },
};

// NEW Implementation:
const dataProvider: Provider = {
  name: 'dataProvider',
  description: 'Fetches external data',
  dynamic: true,
  get: async (runtime, message, state) => {
    const data = await fetchSomeData();
    return {
      data: data,
      text: `Fetched ${Object.keys(data).length} items`,
    };
  },
};
```

#### Example 3: Complex Provider with All Options

```typescript
// NEW Implementation with all options:
const complexProvider: Provider = {
  name: 'complexProvider',
  description: 'A complex provider with all options',
  dynamic: true,
  position: 10, // Higher priority in provider list
  private: false, // Shown in provider list
  get: async (runtime, message, state) => {
    elizaLogger.debug('complexProvider::get');

    const values = {
      timestamp: Date.now(),
      userId: message.userId,
    };

    const data = await fetchComplexData();

    const text = formatDataAsText(data);

    return {
      text,
      values,
      data,
    };
  },
};
```

### 7.5 Provider Options Explained

- **`name`** (required): Unique identifier used to reference the provider
- **`description`**: Human-readable description of what the provider does
- **`dynamic`**: Set to `true` if the provider returns different data based on context
- **`position`**: Controls ordering in provider lists (positive = higher priority)
- **`private`**: Set to `true` to hide from public provider lists (must be called explicitly)

### 7.6 Best Practices

1. **Always include descriptive names**: Use clear, descriptive names that indicate what the provider does
2. **Return appropriate result types**:
   - Use `text` for human-readable responses
   - Use `data` for structured data that other components might process
   - Use `values` for simple key-value pairs that might be used in templates
3. **Add descriptions**: Help other developers understand your provider's purpose
4. **Use logging**: Include debug logs to help troubleshoot issues
5. **Handle errors gracefully**: Return meaningful error messages in the `text` field

### Important Provider Migration Notes:

- The `name` property is now required for all providers
- Return type must be `ProviderResult` object, not raw values
- The `state` parameter is no longer optional
- Consider adding optional properties (`description`, `dynamic`, etc.) for better documentation and behavior
- Test thoroughly as the runtime may handle providers differently based on these new properties
