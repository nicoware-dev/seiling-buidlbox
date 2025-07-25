# ElizaOS Plugin Testing Guide

This guide provides comprehensive instructions for writing tests for ElizaOS plugins using Bun's test runner.

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Creating Test Utilities](#2-creating-test-utilities)
3. [Testing Actions](#3-testing-actions)
4. [Testing Providers](#4-testing-providers)
5. [Testing Evaluators](#5-testing-evaluators)
6. [Testing Services](#6-testing-services)
7. [Testing Event Handlers](#7-testing-event-handlers)
8. [Advanced Testing Patterns](#8-advanced-testing-patterns)
9. [Best Practices](#9-best-practices)
10. [Running Tests](#10-running-tests)

---

## 1. Test Environment Setup

### Directory Structure

```
src/
  __tests__/
    test-utils.ts         # Shared test utilities and mocks
    index.test.ts         # Main plugin tests
    actions.test.ts       # Action tests
    providers.test.ts     # Provider tests
    evaluators.test.ts    # Evaluator tests
    services.test.ts      # Service tests
  actions/
  providers/
  evaluators/
  services/
  index.ts
```

### Required Dependencies

```json
{
  "devDependencies": {
    "@types/bun": "latest",
    "bun-types": "latest"
  }
}
```

### Base Test Imports

```typescript
import { describe, expect, it, mock, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  type Action,
  type Provider,
  type Evaluator,
  ModelType,
  logger,
} from '@elizaos/core';
```

---

## 2. Creating Test Utilities

Create a comprehensive `test-utils.ts` file with reusable mock objects and helper functions:

```typescript
import { mock } from 'bun:test';
import {
  type IAgentRuntime,
  type Memory,
  type State,
  type Character,
  type UUID,
  type Content,
  type Room,
  type Entity,
  ChannelType,
} from '@elizaos/core';

// Mock Runtime Type
export type MockRuntime = Partial<IAgentRuntime> & {
  agentId: UUID;
  character: Character;
  getSetting: ReturnType<typeof mock>;
  useModel: ReturnType<typeof mock>;
  composeState: ReturnType<typeof mock>;
  createMemory: ReturnType<typeof mock>;
  getMemories: ReturnType<typeof mock>;
  searchMemories: ReturnType<typeof mock>;
  updateMemory: ReturnType<typeof mock>;
  getRoom: ReturnType<typeof mock>;
  getParticipantUserState: ReturnType<typeof mock>;
  setParticipantUserState: ReturnType<typeof mock>;
  emitEvent: ReturnType<typeof mock>;
  getTasks: ReturnType<typeof mock>;
  providers: any[];
  actions: any[];
  evaluators: any[];
  services: any[];
};

// Create Mock Runtime
export function createMockRuntime(overrides: Partial<MockRuntime> = {}): MockRuntime {
  return {
    agentId: 'test-agent-id' as UUID,
    character: {
      name: 'Test Agent',
      bio: 'A test agent for unit testing',
      templates: {
        messageHandlerTemplate: 'Test template {{recentMessages}}',
        shouldRespondTemplate: 'Should respond {{recentMessages}}',
      },
    } as Character,

    // Core methods with default implementations
    useModel: mock().mockResolvedValue('Mock response'),
    composeState: mock().mockResolvedValue({
      values: {
        agentName: 'Test Agent',
        recentMessages: 'Test message',
      },
      data: {
        room: {
          id: 'test-room-id',
          type: ChannelType.DIRECT,
        },
      },
    }),
    createMemory: mock().mockResolvedValue({ id: 'memory-id' }),
    getMemories: mock().mockResolvedValue([]),
    searchMemories: mock().mockResolvedValue([]),
    updateMemory: mock().mockResolvedValue(undefined),
    getSetting: mock().mockImplementation((key: string) => {
      const settings: Record<string, string> = {
        TEST_SETTING: 'test-value',
        API_KEY: 'test-api-key',
        // Add common settings your plugin might need
      };
      return settings[key];
    }),
    getRoom: mock().mockResolvedValue({
      id: 'test-room-id',
      type: ChannelType.DIRECT,
      worldId: 'test-world-id',
      serverId: 'test-server-id',
      source: 'test',
    }),
    getParticipantUserState: mock().mockResolvedValue('ACTIVE'),
    setParticipantUserState: mock().mockResolvedValue(undefined),
    emitEvent: mock().mockResolvedValue(undefined),
    getTasks: mock().mockResolvedValue([]),

    // Provider/action/evaluator lists
    providers: [],
    actions: [],
    evaluators: [],
    services: [],

    // Override with custom implementations
    ...overrides,
  };
}

// Create Mock Memory
export function createMockMemory(overrides: Partial<Memory> = {}): Partial<Memory> {
  return {
    id: 'test-message-id' as UUID,
    roomId: 'test-room-id' as UUID,
    entityId: 'test-entity-id' as UUID,
    agentId: 'test-agent-id' as UUID,
    content: {
      text: 'Test message',
      channelType: ChannelType.DIRECT,
      source: 'direct',
    } as Content,
    createdAt: Date.now(),
    userId: 'test-user-id' as UUID,
    ...overrides,
  };
}

// Create Mock State
export function createMockState(overrides: Partial<State> = {}): Partial<State> {
  return {
    values: {
      agentName: 'Test Agent',
      recentMessages: 'User: Test message',
      ...overrides.values,
    },
    data: {
      room: {
        id: 'test-room-id',
        type: ChannelType.DIRECT,
      },
      ...overrides.data,
    },
    ...overrides,
  };
}

// Setup Action Test Helper
export function setupActionTest(
  options: {
    runtimeOverrides?: Partial<MockRuntime>;
    messageOverrides?: Partial<Memory>;
    stateOverrides?: Partial<State>;
  } = {}
) {
  const mockRuntime = createMockRuntime(options.runtimeOverrides);
  const mockMessage = createMockMemory(options.messageOverrides);
  const mockState = createMockState(options.stateOverrides);
  const callbackFn = mock().mockResolvedValue([]);

  return {
    mockRuntime,
    mockMessage,
    mockState,
    callbackFn,
  };
}

// Mock Logger Helper
export function mockLogger() {
  spyOn(logger, 'error').mockImplementation(() => {});
  spyOn(logger, 'warn').mockImplementation(() => {});
  spyOn(logger, 'info').mockImplementation(() => {});
  spyOn(logger, 'debug').mockImplementation(() => {});
}
```

---

## 3. Testing Actions

### Basic Action Test Structure

```typescript
// src/__tests__/actions.test.ts
import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { myAction } from '../actions/myAction';
import { setupActionTest, mockLogger } from './test-utils';
import type { MockRuntime } from './test-utils';
import {
  type IAgentRuntime,
  type Memory,
  type State,
  type HandlerCallback,
  ModelType,
} from '@elizaos/core';

describe('My Action', () => {
  let mockRuntime: MockRuntime;
  let mockMessage: Partial<Memory>;
  let mockState: Partial<State>;
  let callbackFn: HandlerCallback;

  beforeEach(() => {
    mockLogger();
    const setup = setupActionTest();
    mockRuntime = setup.mockRuntime;
    mockMessage = setup.mockMessage;
    mockState = setup.mockState;
    callbackFn = setup.callbackFn as HandlerCallback;
  });

  afterEach(() => {
    mock.restore();
  });

  describe('validation', () => {
    it('should validate when conditions are met', async () => {
      // Setup message content that should validate
      mockMessage.content = {
        text: 'perform action',
        channelType: 'direct',
      };

      const isValid = await myAction.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State
      );

      expect(isValid).toBe(true);
    });

    it('should not validate when conditions are not met', async () => {
      // Setup message content that should not validate
      mockMessage.content = {
        text: 'unrelated message',
        channelType: 'direct',
      };

      const isValid = await myAction.validate(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State
      );

      expect(isValid).toBe(false);
    });
  });

  describe('handler', () => {
    it('should handle action successfully', async () => {
      // Mock runtime methods specific to this action
      mockRuntime.useModel = mock().mockResolvedValue({
        action: 'PERFORM',
        parameters: { value: 'test' },
      });

      const result = await myAction.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn
      );

      expect(result).toBe(true);
      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.any(String),
          content: expect.any(Object),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock an error scenario
      mockRuntime.useModel = mock().mockRejectedValue(new Error('Model error'));

      await myAction.handler(
        mockRuntime as IAgentRuntime,
        mockMessage as Memory,
        mockState as State,
        {},
        callbackFn
      );

      expect(callbackFn).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('error'),
        })
      );
    });
  });
});
```

### Testing Async Actions

```typescript
describe('Async Action', () => {
  it('should handle async operations', async () => {
    const setup = setupActionTest({
      runtimeOverrides: {
        useModel: mock().mockImplementation(async (modelType) => {
          // Simulate async delay
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { result: 'async result' };
        }),
      },
    });

    const result = await asyncAction.handler(
      setup.mockRuntime as IAgentRuntime,
      setup.mockMessage as Memory,
      setup.mockState as State,
      {},
      setup.callbackFn as HandlerCallback
    );

    expect(result).toBe(true);
    expect(setup.callbackFn).toHaveBeenCalled();
  });
});
```

---

## 4. Testing Providers

```typescript
// src/__tests__/providers.test.ts
import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { myProvider } from '../providers/myProvider';
import { createMockRuntime, createMockMemory, createMockState } from './test-utils';
import { type IAgentRuntime, type Memory, type State } from '@elizaos/core';

describe('My Provider', () => {
  let mockRuntime: any;
  let mockMessage: Partial<Memory>;
  let mockState: Partial<State>;

  beforeEach(() => {
    mockRuntime = createMockRuntime();
    mockMessage = createMockMemory();
    mockState = createMockState();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should have required properties', () => {
    expect(myProvider.name).toBe('MY_PROVIDER');
    expect(myProvider.get).toBeDefined();
    expect(typeof myProvider.get).toBe('function');
  });

  it('should return data in correct format', async () => {
    // Mock any runtime methods the provider uses
    mockRuntime.getMemories = mock().mockResolvedValue([
      { content: { text: 'Memory 1' }, createdAt: Date.now() },
      { content: { text: 'Memory 2' }, createdAt: Date.now() - 1000 },
    ]);

    const result = await myProvider.get(
      mockRuntime as IAgentRuntime,
      mockMessage as Memory,
      mockState as State
    );

    expect(result).toMatchObject({
      text: expect.any(String),
      data: expect.any(Object),
    });
  });

  it('should handle empty data gracefully', async () => {
    mockRuntime.getMemories = mock().mockResolvedValue([]);

    const result = await myProvider.get(
      mockRuntime as IAgentRuntime,
      mockMessage as Memory,
      mockState as State
    );

    expect(result).toBeDefined();
    expect(result.text).toContain('No data available');
  });

  it('should handle errors gracefully', async () => {
    mockRuntime.getMemories = mock().mockRejectedValue(new Error('Database error'));

    const result = await myProvider.get(
      mockRuntime as IAgentRuntime,
      mockMessage as Memory,
      mockState as State
    );

    expect(result).toBeDefined();
    expect(result.text).toContain('Error retrieving data');
  });
});
```

---

## 5. Testing Evaluators

```typescript
// src/__tests__/evaluators.test.ts
import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { myEvaluator } from '../evaluators/myEvaluator';
import { createMockRuntime, createMockMemory, createMockState } from './test-utils';
import { type IAgentRuntime, type Memory, type State } from '@elizaos/core';

describe('My Evaluator', () => {
  let mockRuntime: any;
  let mockMessage: Partial<Memory>;
  let mockState: Partial<State>;

  beforeEach(() => {
    mockRuntime = createMockRuntime();
    mockMessage = createMockMemory();
    mockState = createMockState();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should have required properties', () => {
    expect(myEvaluator.name).toBe('MY_EVALUATOR');
    expect(myEvaluator.evaluate).toBeDefined();
    expect(myEvaluator.validate).toBeDefined();
  });

  it('should validate when conditions are met', async () => {
    const isValid = await myEvaluator.validate(
      mockRuntime as IAgentRuntime,
      mockMessage as Memory,
      mockState as State
    );

    expect(isValid).toBe(true);
  });

  it('should evaluate and create memory', async () => {
    mockRuntime.createMemory = mock().mockResolvedValue({ id: 'new-memory-id' });

    await myEvaluator.evaluate(
      mockRuntime as IAgentRuntime,
      mockMessage as Memory,
      mockState as State,
      {}
    );

    expect(mockRuntime.createMemory).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          text: expect.any(String),
        }),
      }),
      expect.any(String) // tableName
    );
  });

  it('should not create memory when evaluation fails', async () => {
    // Mock a scenario where evaluation should fail
    mockMessage.content = { text: 'invalid content' };

    await myEvaluator.evaluate(
      mockRuntime as IAgentRuntime,
      mockMessage as Memory,
      mockState as State,
      {}
    );

    expect(mockRuntime.createMemory).not.toHaveBeenCalled();
  });
});
```

---

## 6. Testing Services

```typescript
// src/__tests__/services.test.ts
import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { myService } from '../services/myService';
import { createMockRuntime } from './test-utils';
import { type IAgentRuntime } from '@elizaos/core';

describe('My Service', () => {
  let mockRuntime: any;

  beforeEach(() => {
    mockRuntime = createMockRuntime();
  });

  afterEach(() => {
    mock.restore();
  });

  it('should initialize service', async () => {
    const service = await myService.initialize(mockRuntime as IAgentRuntime);

    expect(service).toBeDefined();
    expect(service.start).toBeDefined();
    expect(service.stop).toBeDefined();
  });

  it('should start service successfully', async () => {
    const service = await myService.initialize(mockRuntime as IAgentRuntime);
    const startSpy = mock(service.start);

    await service.start();

    expect(startSpy).toHaveBeenCalled();
  });

  it('should stop service successfully', async () => {
    const service = await myService.initialize(mockRuntime as IAgentRuntime);
    await service.start();

    const stopSpy = mock(service.stop);
    await service.stop();

    expect(stopSpy).toHaveBeenCalled();
  });

  it('should handle service errors', async () => {
    const service = await myService.initialize(mockRuntime as IAgentRuntime);
    service.start = mock().mockRejectedValue(new Error('Service start failed'));

    await expect(service.start()).rejects.toThrow('Service start failed');
  });
});
```

---

## 7. Testing Event Handlers

```typescript
// src/__tests__/events.test.ts
import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { myPlugin } from '../index';
import { setupActionTest } from './test-utils';
import {
  type IAgentRuntime,
  type Memory,
  EventType,
  type MessagePayload,
  type EntityPayload,
} from '@elizaos/core';

describe('Event Handlers', () => {
  let mockRuntime: any;
  let mockMessage: Partial<Memory>;
  let mockCallback: any;

  beforeEach(() => {
    const setup = setupActionTest();
    mockRuntime = setup.mockRuntime;
    mockMessage = setup.mockMessage;
    mockCallback = setup.callbackFn;
  });

  afterEach(() => {
    mock.restore();
  });

  it('should handle MESSAGE_RECEIVED event', async () => {
    const messageHandler = myPlugin.events?.[EventType.MESSAGE_RECEIVED]?.[0];
    expect(messageHandler).toBeDefined();

    if (messageHandler) {
      await messageHandler({
        runtime: mockRuntime as IAgentRuntime,
        message: mockMessage as Memory,
        callback: mockCallback,
        source: 'test',
      } as MessagePayload);

      expect(mockRuntime.createMemory).toHaveBeenCalledWith(mockMessage, 'messages');
    }
  });

  it('should handle ENTITY_JOINED event', async () => {
    const entityHandler = myPlugin.events?.[EventType.ENTITY_JOINED]?.[0];
    expect(entityHandler).toBeDefined();

    if (entityHandler) {
      await entityHandler({
        runtime: mockRuntime as IAgentRuntime,
        entityId: 'test-entity-id',
        worldId: 'test-world-id',
        roomId: 'test-room-id',
        metadata: {
          type: 'user',
          username: 'testuser',
        },
        source: 'test',
      } as EntityPayload);

      expect(mockRuntime.ensureConnection).toHaveBeenCalled();
    }
  });
});
```

---

## 8. Advanced Testing Patterns

### Testing with Complex State

```typescript
describe('Complex State Action', () => {
  it('should handle complex state transformations', async () => {
    const setup = setupActionTest({
      stateOverrides: {
        values: {
          taskList: ['task1', 'task2'],
          currentStep: 2,
          metadata: { key: 'value' },
        },
        data: {
          customData: {
            nested: {
              value: 'deep',
            },
          },
        },
      },
    });

    const result = await complexAction.handler(
      setup.mockRuntime as IAgentRuntime,
      setup.mockMessage as Memory,
      setup.mockState as State,
      {},
      setup.callbackFn as HandlerCallback
    );

    expect(result).toBe(true);
  });
});
```

### Testing with Multiple Mock Responses

```typescript
describe('Sequential Operations', () => {
  it('should handle sequential API calls', async () => {
    const setup = setupActionTest({
      runtimeOverrides: {
        useModel: mock()
          .mockResolvedValueOnce({ step: 1, data: 'first' })
          .mockResolvedValueOnce({ step: 2, data: 'second' })
          .mockResolvedValueOnce({ step: 3, data: 'final' }),
      },
    });

    await sequentialAction.handler(
      setup.mockRuntime as IAgentRuntime,
      setup.mockMessage as Memory,
      setup.mockState as State,
      {},
      setup.callbackFn as HandlerCallback
    );

    expect(setup.mockRuntime.useModel).toHaveBeenCalledTimes(3);
    expect(setup.callbackFn).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('final'),
      })
    );
  });
});
```

### Testing Error Recovery

```typescript
describe('Error Recovery', () => {
  it('should retry on failure', async () => {
    let attempts = 0;
    const setup = setupActionTest({
      runtimeOverrides: {
        useModel: mock().mockImplementation(async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return { success: true };
        }),
      },
    });

    await retryAction.handler(
      setup.mockRuntime as IAgentRuntime,
      setup.mockMessage as Memory,
      setup.mockState as State,
      {},
      setup.callbackFn as HandlerCallback
    );

    expect(attempts).toBe(3);
    expect(setup.callbackFn).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({ success: true }),
      })
    );
  });
});
```

---

## 9. Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow the Arrange-Act-Assert pattern
- Keep tests focused and independent

### 2. Mock Management

```typescript
// Good: Specific mocks for each test
it('should handle specific scenario', async () => {
  const setup = setupActionTest({
    runtimeOverrides: {
      useModel: mock().mockResolvedValue({ specific: 'response' }),
    },
  });
  // ... test implementation
});

// Bad: Global mocks that affect all tests
beforeAll(() => {
  globalMock = mock().mockResolvedValue('global response');
});
```

### 3. Assertion Patterns

```typescript
// Check callback was called with correct structure
expect(callbackFn).toHaveBeenCalledWith(
  expect.objectContaining({
    text: expect.stringContaining('expected text'),
    content: expect.objectContaining({
      success: true,
      data: expect.arrayContaining(['item1', 'item2']),
    }),
  })
);

// Check multiple calls in sequence
const calls = (callbackFn as any).mock.calls;
expect(calls).toHaveLength(3);
expect(calls[0][0].text).toContain('step 1');
expect(calls[1][0].text).toContain('step 2');
expect(calls[2][0].text).toContain('completed');
```

### 4. Testing Edge Cases

```typescript
describe('Edge Cases', () => {
  it('should handle empty input', async () => {
    mockMessage.content = { text: '' };
    // ... test implementation
  });

  it('should handle null values', async () => {
    mockMessage.content = null as any;
    // ... test implementation
  });

  it('should handle very long input', async () => {
    mockMessage.content = { text: 'a'.repeat(10000) };
    // ... test implementation
  });
});
```

### 5. Async Testing Best Practices

```typescript
// Always await async operations
it('should handle async operations', async () => {
  const promise = someAsyncOperation();
  await expect(promise).resolves.toBe(expectedValue);
});

// Test rejected promises
it('should handle errors', async () => {
  const promise = failingOperation();
  await expect(promise).rejects.toThrow('Expected error');
});

// Use async/await instead of .then()
it('should process data', async () => {
  const result = await processData();
  expect(result).toBeDefined();
});
```

### 6. Cleanup

```typescript
afterEach(() => {
  // Reset all mocks after each test
  mock.restore();

  // Clean up any side effects
  // Clear timers, close connections, etc.
});
```

### 7. Test Coverage Requirements

**IMPORTANT**: All ElizaOS plugins must maintain 100% test coverage or as close to it as possible (minimum 95%).

```typescript
// Ensure all code paths are tested
describe('Complete Coverage', () => {
  it('should test success path', async () => {
    // Test the happy path
  });

  it('should test error handling', async () => {
    // Test error scenarios
  });

  it('should test edge cases', async () => {
    // Test boundary conditions
  });

  it('should test all conditional branches', async () => {
    // Test if/else, switch cases, etc.
  });
});
```

**Coverage Best Practices:**

- Use `bun test --coverage` to check coverage regularly
- Set up CI/CD to fail builds with coverage below 95%
- Document any legitimate reasons for uncovered code
- Focus on meaningful tests, not just hitting coverage numbers
- Test all exports from your plugin (actions, providers, evaluators, services)

---

## 10. Running Tests

### Basic Commands

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test --watch

# Run specific test file
bun run test src/__tests__/actions.test.ts

# Run tests with coverage
bun run test:coverage

# Run tests matching pattern
bun run test --test-name-pattern "should validate"
```

### Test Configuration

Create a `bunfig.toml` file in your project root:

```toml
[test]
root = "./src/__tests__"
coverage = true
coverageThreshold = 95  # Minimum 95% coverage required, aim for 100%
```

### Debugging Tests

```typescript
// Add console.logs for debugging
it('should debug test', async () => {
    console.log('Current state:', mockState);

    const result = await action.handler(...);

    console.log('Result:', result);
    console.log('Callback calls:', (callbackFn as any).mock.calls);
});
```

### Common Issues and Solutions

#### Issue: Mock not being called

```typescript
// Solution: Ensure the mock is set before the action is called
mockRuntime.useModel = mock().mockResolvedValue(response);
// THEN call the action
await action.handler(...);
```

#### Issue: Tests timing out

```typescript
// Solution: Mock all async dependencies
beforeEach(() => {
  // Mock all external calls
  mockRuntime.getMemories = mock().mockResolvedValue([]);
  mockRuntime.searchMemories = mock().mockResolvedValue([]);
  mockRuntime.createMemory = mock().mockResolvedValue({ id: 'test' });
});
```

#### Issue: Inconsistent test results

```typescript
// Solution: Reset mocks between tests
afterEach(() => {
  mock.restore();
});

// And use fresh setup for each test
beforeEach(() => {
  const setup = setupActionTest();
  // ... assign to test variables
});
```

---

## Summary

This guide provides a comprehensive approach to testing ElizaOS plugins. Key takeaways:

1. **Setup a consistent test environment** with reusable utilities
2. **Test all plugin components**: actions, providers, evaluators, services, and event handlers
3. **Mock external dependencies** properly to ensure isolated tests
4. **Handle async operations** correctly with proper awaits
5. **Follow best practices** for organization, assertions, and cleanup
6. **Run tests regularly** as part of your development workflow

Remember: Good tests are as important as good code. They ensure your plugin works correctly and continues to work as the codebase evolves.
