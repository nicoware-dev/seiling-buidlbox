# ElizaOS State Management & Providers Guide - v1.x

> **Important**: This guide provides comprehensive documentation for the `composeState` method and Providers in v1.x, including comparisons with v0.

## Table of Contents

- [State Management with composeState](#state-management-with-composestate)
  - [Basic Usage](#basic-usage)
  - [State Filtering](#state-filtering)
  - [Available State Keys](#available-state-keys)
  - [Performance Optimization](#performance-optimization)
- [Providers in v1](#providers-in-v1)
  - [Provider Interface](#provider-interface)
  - [Creating Providers](#creating-providers)
  - [Provider Options](#provider-options)
  - [Provider Best Practices](#provider-best-practices)
- [v0 vs v1 Comparison](#v0-vs-v1-comparison)

---

## State Management with composeState

The `composeState` method is the central mechanism for building the context state that powers agent responses. In v1, it has been enhanced with powerful filtering capabilities.

### Basic Usage

```typescript
// v1: Basic state composition
const state = await runtime.composeState(message);
```

This creates a complete state object containing all available context:

- Agent information (bio, lore, personality)
- Conversation history
- Room and participant details
- Available actions and evaluators
- Knowledge and RAG data
- Provider-generated context

### State Filtering

The v1 `composeState` method introduces filtering capabilities for performance optimization:

```typescript
// v1: Signature
composeState(
  message: Memory,
  includeList?: string[],    // Keys to include
  onlyInclude?: boolean,     // If true, ONLY include listed keys
  skipCache?: boolean        // Skip caching mechanism
): Promise<State>
```

#### Filtering Examples

```typescript
// Include only specific state keys
const minimalState = await runtime.composeState(
  message,
  ['agentName', 'bio', 'recentMessages'],
  true // onlyInclude = true
);

// Update only specific parts of existing state
const updatedState = await runtime.composeState(
  message,
  ['RECENT_MESSAGES', 'GOALS'] // Update only these
);

// Skip cache for fresh data
const freshState = await runtime.composeState(
  message,
  undefined,
  false,
  true // skipCache = true
);
```

### Available State Keys

Here are the primary state keys you can filter:

#### Core Agent Information

- `agentId` - Agent's UUID
- `agentName` - Agent's display name
- `bio` - Agent biography (string or selected from array)
- `lore` - Random selection of lore bits
- `adjective` - Random adjective from character
- `topic` / `topics` - Agent's interests

#### Conversation Context

- `recentMessages` - Formatted recent messages
- `recentMessagesData` - Raw message Memory objects
- `recentPosts` - Formatted posts in thread
- `attachments` - Formatted attachment information

#### Interaction History

- `recentMessageInteractions` - Past interactions as messages
- `recentPostInteractions` - Past interactions as posts
- `recentInteractionsData` - Raw interaction Memory[]

#### Character Examples

- `characterPostExamples` - Example posts from character
- `characterMessageExamples` - Example conversations

#### Directions & Style

- `messageDirections` - Message style guidelines
- `postDirections` - Post style guidelines

#### Room & Participants

- `roomId` - Current room UUID
- `actors` - Formatted actor information
- `actorsData` - Raw Actor[] array
- `senderName` - Name of message sender

#### Goals & Actions

- `goals` - Formatted goals string
- `goalsData` - Raw Goal[] array
- `actionNames` - Available action names
- `actions` - Formatted action descriptions
- `actionExamples` - Action usage examples

#### Evaluators

- `evaluators` - Formatted evaluator information
- `evaluatorNames` - List of evaluator names
- `evaluatorExamples` - Evaluator examples
- `evaluatorsData` - Raw Evaluator[] array

#### Knowledge

- `knowledge` - Formatted knowledge text
- `knowledgeData` - Knowledge items
- `ragKnowledgeData` - RAG knowledge items

#### Providers

- `providers` - Additional context from providers

### Performance Optimization

Use filtering to optimize performance by only computing needed state:

```typescript
// Minimal state for simple responses
const quickResponse = await runtime.composeState(
  message,
  ['agentName', 'bio', 'recentMessages', 'messageDirections'],
  true
);

// Full state for complex decision-making
const fullState = await runtime.composeState(message);

// Update pattern for ongoing conversations
let state = await runtime.composeState(message);
// ... later in conversation ...
state = await runtime.composeState(newMessage, ['RECENT_MESSAGES', 'GOALS', 'attachments']);
```

---

## Providers in v1

Providers supply dynamic contextual information to the agent, acting as the agent's "senses" for perceiving external data.

### Provider Interface

```typescript
interface Provider {
  // REQUIRED: Unique identifier
  name: string;

  // Optional metadata
  description?: string;
  dynamic?: boolean;
  position?: number;
  private?: boolean;

  // The data retrieval method
  get: (runtime: IAgentRuntime, message: Memory, state: State) => Promise<ProviderResult>;
}

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

### Creating Providers

#### Simple Text Provider

```typescript
const weatherProvider: Provider = {
  name: 'weatherProvider',
  description: 'Provides current weather information',
  dynamic: true,

  get: async (runtime, message, state) => {
    const weather = await fetchWeatherData();

    return {
      text: `Current weather: ${weather.temp}°F, ${weather.condition}`,
      values: {
        temperature: weather.temp,
        condition: weather.condition,
      },
    };
  },
};
```

#### Complex Data Provider

```typescript
const marketDataProvider: Provider = {
  name: 'marketDataProvider',
  description: 'Provides real-time market data',
  dynamic: true,
  position: 10, // Higher priority

  get: async (runtime, message, state) => {
    const symbols = extractSymbolsFromMessage(message.content.text);
    const marketData = await fetchMarketData(symbols);

    const summary = formatMarketSummary(marketData);

    return {
      text: summary,
      data: marketData,
      values: {
        mentionedSymbols: symbols,
        marketStatus: marketData.status,
      },
    };
  },
};
```

#### Conditional Provider

```typescript
const contextualProvider: Provider = {
  name: 'contextualProvider',
  description: 'Provides context based on conversation',

  get: async (runtime, message, state) => {
    // Access state to make decisions
    const topic = state.topic;
    const recentTopics = analyzeRecentTopics(state.recentMessagesData);

    if (!topic || !recentTopics.includes(topic)) {
      return { text: '' }; // No additional context needed
    }

    const relevantInfo = await fetchTopicInfo(topic);

    return {
      text: `Relevant ${topic} information: ${relevantInfo}`,
      data: { topic, info: relevantInfo },
    };
  },
};
```

### Provider Options

#### `dynamic` Property

Set to `true` for providers that return different data based on context:

```typescript
const timeProvider: Provider = {
  name: 'timeProvider',
  dynamic: true, // Time always changes
  get: async () => ({
    text: `Current time: ${new Date().toLocaleString()}`,
    values: { timestamp: Date.now() },
  }),
};
```

#### `position` Property

Controls provider priority (higher = higher priority):

```typescript
const criticalProvider: Provider = {
  name: 'criticalProvider',
  position: 100, // Will be processed before lower position providers
  get: async () => ({ text: 'Critical information...' }),
};
```

#### `private` Property

Hide from public provider lists:

```typescript
const internalProvider: Provider = {
  name: 'internalProvider',
  private: true, // Won't appear in provider lists
  get: async () => ({ text: 'Internal data...' }),
};
```

### Provider Best Practices

1. **Always Return ProviderResult**

```typescript
// ❌ Bad - returning raw value
get: async () => 'Some text';

// ✅ Good - returning ProviderResult
get: async () => ({ text: 'Some text' });
```

2. **Use Appropriate Return Fields**

```typescript
return {
  // Human-readable summary
  text: 'Market is up 2.5% today',

  // Simple key-value pairs for templates
  values: {
    marketChange: 2.5,
    marketStatus: 'bullish'
  },

  // Complex nested data for processing
  data: {
    stocks: [...],
    analysis: {...}
  }
};
```

3. **Handle Errors Gracefully**

```typescript
get: async (runtime, message, state) => {
  try {
    const data = await fetchExternalData();
    return { text: formatData(data), data };
  } catch (error) {
    elizaLogger.error('Provider error:', error);
    return {
      text: 'Unable to fetch data at this time',
      values: { error: true },
    };
  }
};
```

4. **Optimize Performance**

```typescript
const cachedProvider: Provider = {
  name: 'cachedProvider',
  dynamic: false, // Indicates static data

  get: async (runtime) => {
    // Check cache first
    const cached = await runtime.getSetting('providerCache');
    if (cached && !isExpired(cached)) {
      return { data: cached.data };
    }

    // Fetch fresh data
    const fresh = await fetchData();
    await runtime.setSetting('providerCache', {
      data: fresh,
      timestamp: Date.now(),
    });

    return { data: fresh };
  },
};
```

---

## v0 vs v1 Comparison

### composeState Changes

#### Method Signature

```typescript
// v0: Simple with additional keys
composeState(
  message: Memory,
  additionalKeys?: { [key: string]: unknown }
): Promise<State>

// v1: Advanced with filtering
composeState(
  message: Memory,
  includeList?: string[],
  onlyInclude?: boolean,
  skipCache?: boolean
): Promise<State>
```

#### Key Differences:

1. **Filtering**: v1 allows selective state composition
2. **Performance**: Can request only needed state keys
3. **Caching**: Explicit cache control with `skipCache`
4. **Update Pattern**: Use same method for updates with specific keys

#### Migration Example:

```typescript
// v0: Update pattern
state = await runtime.updateRecentMessageState(state);

// v1: Update pattern
state = await runtime.composeState(message, ['RECENT_MESSAGES']);
```

### Provider Changes

#### Interface Changes

```typescript
// v0: Minimal interface
interface Provider {
  get: (runtime, message, state?) => Promise<any>;
}

// v1: Rich interface
interface Provider {
  name: string; // REQUIRED
  description?: string;
  dynamic?: boolean;
  position?: number;
  private?: boolean;
  get: (runtime, message, state) => Promise<ProviderResult>;
}
```

#### Return Type Changes

```typescript
// v0: Return anything
return 'Some text';
return { data: 'value' };

// v1: Return ProviderResult
return {
  text: 'Human readable',
  values: { key: 'value' },
  data: { complex: 'object' },
};
```

#### Key Differences:

1. **Required Name**: Every provider must have unique `name`
2. **Structured Returns**: Must return `ProviderResult` object
3. **Rich Metadata**: Can specify behavior with options
4. **State Parameter**: No longer optional in `get` method
5. **Better Organization**: Clear separation of text, values, and data

### Migration Checklist

- [ ] Add `name` property to all providers
- [ ] Update return statements to use `ProviderResult` format
- [ ] Remove optional `?` from state parameter in get method
- [ ] Consider adding `description` for documentation
- [ ] Use `dynamic: true` for context-dependent providers
- [ ] Replace `updateRecentMessageState` with filtered `composeState`
- [ ] Optimize performance by filtering state keys
- [ ] Add error handling with graceful fallbacks
- [ ] Consider caching strategies for expensive operations

---

## Examples & Patterns

### State Filtering Pattern

```typescript
// Initial load - get essential state
const initialState = await runtime.composeState(
  message,
  ['agentName', 'bio', 'recentMessages', 'actions', 'providers'],
  true
);

// Process message...

// Update only what changed
const updatedState = await runtime.composeState(message, [
  'RECENT_MESSAGES',
  'goals',
  'attachments',
]);
```

### Provider Chain Pattern

```typescript
const providers = [
  weatherProvider, // position: 10
  newsProvider, // position: 5
  marketProvider, // position: 15
  fallbackProvider, // position: 1
];

// Will be processed in order: market, weather, news, fallback
runtime.providers = providers.sort((a, b) => (b.position || 0) - (a.position || 0));
```

### Conditional State Building

```typescript
const buildState = async (message: Memory, isDetailedResponse: boolean) => {
  const baseKeys = ['agentName', 'bio', 'recentMessages'];

  const keys = isDetailedResponse
    ? [...baseKeys, 'lore', 'topics', 'characterMessageExamples', 'knowledge']
    : baseKeys;

  return runtime.composeState(message, keys, true);
};
```
