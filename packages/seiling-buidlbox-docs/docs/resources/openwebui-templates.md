# OpenWebUI Templates

> **Custom functions for extending OpenWebUI**

The `resources/openwebui/` folder contains Python function pipes that extend OpenWebUI's capabilities with integrations to other Seiling services.

## Available Functions

### Eliza Pipe
- **File**: `function-Eliza_Pipe.py`
- **Purpose**: Direct integration with ElizaOS agents
- **Features**: Natural language to agent communication
- **Use case**: Chat with blockchain-aware AI agents

### Cambrian Pipe
- **File**: `function-Cambrian_Pipe.py`
- **Purpose**: Access Cambrian multi-modal agents
- **Features**: DeFi operations through chat
- **Use case**: Portfolio management via conversation

### Flowise Pipe
- **File**: `function-Flowise_Pipe.py`
- **Purpose**: Execute Flowise agents from chat
- **Features**: Dynamic flow execution
- **Use case**: Trigger complex AI workflows

### N8N Pipe
- **File**: `function-N8N_Pipe.py`
- **Purpose**: Trigger n8n workflows from chat
- **Features**: Workflow parameter passing
- **Use case**: Automation triggers via natural language

## Installation

### Access OpenWebUI Admin
1. Open http://localhost:5002
2. Settings → Admin Panel
3. Functions → Import Function

### Import Function
1. **Copy Code**: From `resources/openwebui/` files
2. **Paste**: Into function editor
3. **Configure**: Required parameters
4. **Save & Enable**: Activate function

### Function Setup
Each function requires:
- **Service URLs**: Usually auto-configured for localhost
- **API Keys**: For external services
- **Enable Toggle**: Must be turned on

## Function Details

### Eliza Pipe Configuration
```python
# Default configuration
ELIZA_BASE_URL = "http://seiling-eliza:5005"
DEFAULT_MODEL = "gpt-4"
```

**Usage**:
- Type naturally in chat
- Responses come from ElizaOS agent
- Includes blockchain context awareness

### Cambrian Pipe Configuration
```python
# Default configuration
CAMBRIAN_BASE_URL = "http://seiling-cambrian:5006"
ENABLE_PORTFOLIO = True
```

**Usage**:
- Portfolio queries: "What's my balance?"
- DeFi operations: "Swap 100 SEI for USDC"
- Market data: "Show me SEI price"

### Flowise Pipe Configuration
```python
# Default configuration
FLOWISE_BASE_URL = "http://seiling-flowise:5003"
DEFAULT_CHATFLOW = "your_flow_id"
```

**Usage**:
- Trigger flows: "Run my trading strategy"
- Query agents: "Analyze this market data"
- Get recommendations: "What should I buy?"

### N8N Pipe Configuration
```python
# Default configuration
N8N_BASE_URL = "http://seiling-n8n:5001"
WEBHOOK_ENDPOINTS = ["webhook1", "webhook2"]
```

**Usage**:
- Start workflows: "Check my portfolio"
- Trigger automation: "Send daily report"
- Monitor services: "Health check all systems"

## Custom Functions

### Creating New Functions
1. **Base Template**: Use existing functions as reference
2. **Service Integration**: Connect to your services
3. **Error Handling**: Include proper error responses
4. **Documentation**: Add clear usage instructions

### Function Structure
```python
# Required function structure
def pipe(body, **kwargs):
    # Process input
    user_message = body.get("messages", [])[-1]["content"]
    
    # Call service
    response = call_service(user_message)
    
    # Return formatted response
    return response
```

### Best Practices
- **Error Handling**: Always catch and handle exceptions
- **Validation**: Validate inputs before processing
- **Logging**: Include debug information
- **Security**: Never expose sensitive data

## Usage Examples

### Portfolio Monitoring
```
User: "What's my current portfolio value?"
Cambrian Pipe: Fetches balance, calculates USD value, shows breakdown
```

### Workflow Automation
```
User: "Run my daily DCA strategy"
N8N Pipe: Triggers n8n workflow, returns execution status
```

### AI Agent Queries
```
User: "Should I buy more SEI today?"
Eliza Pipe: Analyzes market, provides AI-powered recommendation
```

### Complex Analysis
```
User: "Analyze my trading performance this month"
Flowise Pipe: Executes analysis flow, returns detailed report
```

## Troubleshooting

### Function Not Working
- Check if function is enabled in admin panel
- Verify service URLs are correct
- Check OpenWebUI logs for errors

### Service Connection Issues
```bash
# Test service connectivity
curl http://localhost:5005/health  # Eliza
curl http://localhost:5006         # Cambrian
curl http://localhost:5003         # Flowise
curl http://localhost:5001/healthz # n8n
```

### Debug Functions
- Add console.log() statements
- Check OpenWebUI function logs
- Test service endpoints manually

### Common Fixes
```bash
# Restart OpenWebUI
docker restart seiling-openwebui

# Check service health
bash scripts/bootstrap/health_check.sh quick

# View logs
docker logs seiling-openwebui --tail=50
```

## Advanced Usage

### Function Chaining
Functions can call other functions for complex workflows:
1. N8N Pipe triggers workflow
2. Workflow calls Eliza for analysis
3. Results formatted by Flowise

### Context Preservation
Functions can maintain conversation context:
- Store user preferences
- Remember previous queries
- Build on conversation history

### Multi-Service Integration
Combine multiple services in one function:
- Query portfolio (Cambrian)
- Analyze with AI (Eliza)
- Execute trades (n8n)
- Report results (all)

---

**OpenWebUI functions provide natural language interfaces to all Seiling services.** Start with basic functions and build more complex integrations. 