# Flowise Templates

> **Agent flow templates for visual AI development**

The `resources/flowise/` folder contains pre-built agent flows that demonstrate common AI patterns and integrations with Seiling services.

## Available Templates

### Seiling Flowise Agentflow Demo
- **File**: `Seiling Flowise Agentflow Demo Agents.json`
- **Purpose**: Complete agent building demonstration
- **Features**: Multi-service integration, common AI patterns
- **Best for**: Understanding Flowise capabilities

## Template Features

### Core Components
- **LLM Integration**: OpenAI, Anthropic, Google AI support
- **Memory Management**: Conversation context preservation
- **Tool Integration**: Custom tools and APIs
- **Vector Storage**: Document embeddings and search
- **Chain Orchestration**: Multi-step reasoning flows

### Seiling Integration
- **Sei MCP Tools**: Blockchain operations
- **Database Connections**: PostgreSQL, Redis access
- **Service APIs**: n8n, OpenWebUI integration
- **Custom Functions**: Seiling-specific operations

## Import Instructions

### Step 1: Access Flowise
```bash
# Open Flowise interface
http://localhost:5003

# Login credentials
Username: admin
Password: seiling123
```

### Step 2: Import Template
1. **Chatflows** → **Load Chatflow**
2. **Upload** file from `resources/flowise/`
3. **Import** and **Save**

### Step 3: Configure
1. **API Keys**: Add OpenAI, other AI service keys
2. **Service URLs**: Update if using custom ports
3. **Database Connections**: Configure if needed
4. **Test Flow**: Run test queries

## Agent Patterns

### Basic Chatbot
```
User Input → LLM Processing → Response
```

### RAG (Retrieval Augmented Generation)
```
User Query → Vector Search → Context + LLM → Response
```

### Tool-Enabled Agent
```
User Input → Intent Detection → Tool Selection → Tool Execution → Response
```

### Multi-Step Reasoning
```
User Query → Planning → Sub-tasks → Tool Calls → Synthesis → Response
```

## Configuration

### Required Settings
- **OpenAI API Key**: For LLM processing
- **Vector Database**: Qdrant connection
- **Memory Store**: Redis for conversation context

### Optional Integrations
- **Sei MCP Server**: Blockchain tool access
- **PostgreSQL**: Persistent data storage
- **Custom APIs**: External service integration

## Common Use Cases

### DeFi Assistant
**Flow**: Query → Market Data → Portfolio Analysis → Recommendations
**Tools**: Sei MCP, Price APIs, Portfolio tracker

### Trading Bot
**Flow**: Market Signal → Analysis → Risk Assessment → Trade Execution
**Tools**: Sei MCP, DEX APIs, Risk models

### Research Agent
**Flow**: Topic → Data Gathering → Analysis → Report Generation
**Tools**: Web scraping, Document processing, Summary generation

### Portfolio Manager
**Flow**: Portfolio Query → Analysis → Optimization → Action Plan
**Tools**: Sei MCP, Analytics, Rebalancing logic

## Customization

### Adding New Tools
1. **Tools** → **Custom Tool**
2. **Configure API**: Endpoint, parameters
3. **Add to Flow**: Connect to chain
4. **Test Integration**: Verify functionality

### Memory Configuration
```javascript
// Memory settings
{
  "memoryType": "redis",
  "redisUrl": "redis://seiling-redis:6379",
  "sessionTTL": 3600
}
```

### Vector Store Setup
```javascript
// Qdrant configuration
{
  "url": "http://seiling-qdrant:6333",
  "collectionName": "seiling_docs",
  "dimension": 1536
}
```

## Advanced Features

### Chain Composition
- **Sequential Chains**: Step-by-step processing
- **Parallel Chains**: Concurrent operations
- **Conditional Chains**: Decision-based routing
- **Loop Chains**: Iterative processing

### Context Management
- **Conversation Memory**: Multi-turn dialogs
- **Session Storage**: User-specific data
- **Document Context**: RAG implementation
- **Tool Memory**: Action history

### Integration Patterns
- **API Calls**: External service integration
- **Database Queries**: Data retrieval and storage
- **File Processing**: Document analysis
- **Real-time Data**: Live API feeds

## Best Practices

### Performance
- **Optimize Chains**: Minimize unnecessary steps
- **Cache Results**: Store frequent queries
- **Batch Operations**: Group similar tasks
- **Stream Responses**: Real-time output

### Security
- **API Key Management**: Secure credential storage
- **Input Validation**: Sanitize user inputs
- **Rate Limiting**: Prevent abuse
- **Access Control**: User permissions

### Reliability
- **Error Handling**: Graceful failure management
- **Retry Logic**: Automatic recovery
- **Fallback Options**: Alternative paths
- **Health Monitoring**: System status checks

## Troubleshooting

### Import Issues
- **File Format**: Ensure valid JSON
- **Version Compatibility**: Check Flowise version
- **Dependencies**: Verify required nodes available

### Runtime Errors
- **API Limits**: Check rate limiting
- **Service Connectivity**: Verify endpoints
- **Memory Issues**: Check Redis connection
- **Tool Failures**: Debug individual tools

### Common Fixes
```bash
# Restart Flowise
docker restart seiling-flowise

# Check logs
docker logs seiling-flowise --tail=50

# Verify dependencies
bash scripts/bootstrap/health_check.sh quick
```

## Creating New Templates

### Template Design
1. **Define Purpose**: Clear use case
2. **Plan Flow**: Map user journey
3. **Select Tools**: Required integrations
4. **Build Incrementally**: Start simple, add complexity
5. **Test Thoroughly**: All execution paths

### Export Template
1. **Chatflows** → **Export**
2. **Save JSON**: Add to resources folder
3. **Document Usage**: Add to guide
4. **Share Template**: Contribute to community

---

**Flowise templates provide visual AI development patterns.** Start with the demo template and customize for your specific needs. 