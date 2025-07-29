# Seiling Buidlbox Resources

> **Templates, examples, and integrations for building AI agents on Sei Network**

This directory contains a comprehensive collection of ready-to-use templates, workflow examples, and integration functions for the Seiling Buidlbox ecosystem. These resources help you quickly get started with building AI agents, automating blockchain operations, and creating sophisticated multi-agent systems.

## 📦 Resource Overview

The resources are organized into **3 main categories**:

### 🔄 **[n8n Workflow Templates](#n8n-workflow-templates)** - 10 Production Templates
Visual workflow automation for blockchain operations and AI agent coordination

### 🤖 **[Flowise Agent Templates](#flowise-agent-templates)** - 1 Complete Demo
Visual AI agent flows with blockchain integration capabilities  

### 🖥️ **[OpenWebUI Functions](#openwebui-functions)** - 4 Service Integrations
Custom Python functions for extending OpenWebUI with service integrations

## 🔄 n8n Workflow Templates

**Location**: `resources/n8n/`

Ready-to-import n8n workflows for blockchain automation and AI agent integration. Each template is production-ready and includes comprehensive documentation.

### 🎯 **Beginner Templates**

#### 1. **Sei MCP Demo** - `Sei MCP Demo.json`
**Basic blockchain operations via MCP protocol**
- **Purpose**: Learn MCP integration basics
- **Features**: List tools, check balances, transfer tokens
- **Prerequisites**: MCP Client HTTP credentials
- **Best For**: Understanding MCP protocol

#### 2. **Cambrian Agent Demo** - `Cambrian Agent Demo.json`  
**Simple DeFi agent integration**
- **Purpose**: Demonstrate Cambrian agent communication
- **Features**: Agent messaging, DeFi queries
- **Prerequisites**: Cambrian service running
- **Best For**: Learning agent workflows

#### 3. **Custom MCP Agent Example** - `Custom MCP Agent Example.json`
**AI-powered blockchain agent**
- **Purpose**: Natural language blockchain operations
- **Features**: Chat interface, intelligent tool selection
- **Prerequisites**: OpenAI + MCP Client credentials
- **Best For**: Conversational blockchain interfaces

### 🚀 **Intermediate Templates**

#### 4. **Sei MCP Agent Example** - `Sei MCP Agent Example.json`
**Advanced AI agent with MCP tools**
- **Purpose**: Sophisticated AI-blockchain integration
- **Features**: Dynamic tool execution, conversation memory
- **Prerequisites**: OpenAI + MCP Server
- **Best For**: Production AI agents

#### 5. **Sei Eliza Demo** - `Sei Eliza Demo.json`
**ElizaOS agent integration**
- **Purpose**: Conversational AI with wallet operations
- **Features**: Channel creation, message handling, responses
- **Prerequisites**: ElizaOS service
- **Best For**: Advanced conversational agents

#### 6. **Sei Nodes Agent Example** - `Sei Nodes Agent Example.json`
**Custom n8n nodes demonstration**
- **Purpose**: Direct blockchain operations using custom nodes
- **Features**: Send SEI, deploy contracts, query data
- **Prerequisites**: Sei account credentials + Custom nodes
- **Best For**: Learning custom n8n nodes

### 🏗️ **Advanced Templates**

#### 7. **Sei Multi-Agent System Example** - `Sei Multi-Agent System Example.json`
**Complex multi-agent orchestration**
- **Purpose**: Coordinate multiple AI agents and tools
- **Features**: Agent collaboration, webhook coordination
- **Prerequisites**: OpenAI + PostgreSQL + Multiple agents
- **Best For**: Enterprise-grade agent systems

#### 8. **Custom Sei Nodes Demo** - `Custom Sei Nodes Demo.json`
**Comprehensive blockchain operations**
- **Purpose**: Complete demonstration of all 5 custom Sei nodes
- **Features**: NFT deployment, token operations, multi-network
- **Prerequisites**: Sei credentials + Custom nodes installed
- **Best For**: Advanced blockchain automation

#### 9. **Custom Sei MCP Server** - `Custom Sei MCP Server.json`
**Complete MCP server implementation**
- **Purpose**: Full-featured blockchain API server
- **Features**: HTTP endpoints, NFT/token operations, balance queries
- **Prerequisites**: Sei account credentials
- **Best For**: Building blockchain APIs

#### 10. **Seiling Buidlbox Full Demo** - `Seiling Buidlbox Full Demo.json`
**Complete system integration showcase**
- **Purpose**: Demonstrate entire platform capabilities
- **Features**: Multi-service integration, end-to-end workflows
- **Prerequisites**: All services configured
- **Best For**: Understanding complete platform

### 📋 **Template Reference**
- **[examples-descriptions.md](n8n/examples-descriptions.md)** - Detailed descriptions and setup instructions for all templates

---

## 🤖 Flowise Agent Templates

**Location**: `resources/flowise/`

Visual AI agent flows designed for blockchain integration and multi-service coordination.

### **Seiling Flowise Agentflow Demo** - `Seiling Flowise Agentflow Demo Agents.json`
**Complete agent building demonstration**

#### Features
- **Visual Agent Builder**: Drag-and-drop agent design
- **MCP Integration**: 27 blockchain tools via Sei MCP Server
- **Multi-Step Reasoning**: Intelligent tool selection and execution
- **Memory Management**: Conversation context preservation
- **OpenAI Integration**: GPT-4o-mini for natural language processing

#### Agent Components
- **Start Node**: Chat input handling
- **Agent Node**: Core AI reasoning with MCP tools
- **Direct Reply**: Response formatting and delivery

#### MCP Tools Available
- Wallet operations (balance, transfers)
- Token operations (ERC20, ERC1155, NFT)
- Smart contract interactions
- Network queries and gas estimation
- DeFi operations and approvals

#### Usage
1. Import into Flowise (http://localhost:5003)
2. Configure OpenAI API key
3. Verify MCP Server connection (http://localhost:5004)
4. Test with blockchain queries
5. Customize for your specific use cases

---

## 🖥️ OpenWebUI Functions

**Location**: `resources/openwebui/`

Custom Python functions that extend OpenWebUI with direct integrations to Seiling services. Install these to add natural language interfaces to all platform services.

### **Service Integration Functions**

#### 1. **Eliza Pipe** - `function-Eliza_Pipe.py`
**Direct ElizaOS agent communication**
- **Purpose**: Chat with ElizaOS agents from OpenWebUI
- **Features**: Natural conversation, blockchain awareness
- **Configuration**: ElizaOS service URL, response timing
- **Usage**: "What's my wallet balance?" → ElizaOS response

#### 2. **Cambrian Pipe** - `function-Cambrian_Pipe.py`
**DeFi-focused agent interactions**
- **Purpose**: Access Cambrian agents for DeFi operations
- **Features**: Portfolio queries, trading operations, market analysis
- **Configuration**: Cambrian agent endpoint
- **Usage**: "Swap 100 SEI for USDC" → Cambrian execution

#### 3. **Flowise Pipe** - `function-Flowise_Pipe.py`
**Agent flow execution**
- **Purpose**: Execute Flowise agent flows from chat
- **Features**: Dynamic flow triggering, result formatting
- **Configuration**: Flowise prediction endpoint
- **Usage**: "Run my trading strategy" → Flowise flow execution

#### 4. **N8N Pipe** - `function-N8N Pipe.py`
**Workflow automation triggers**
- **Purpose**: Trigger n8n workflows via natural language
- **Features**: Webhook execution, parameter passing
- **Configuration**: n8n webhook URLs, bearer tokens
- **Usage**: "Check my portfolio" → n8n workflow execution

### **Function Features**
- **Status Indicators**: Real-time execution feedback
- **Error Handling**: Graceful failure management  
- **Configurable Endpoints**: Easy service URL updates
- **Event Emission**: Live status updates during execution

### **Installation Instructions**
1. **Access OpenWebUI**: http://localhost:5002
2. **Settings** → **Admin Panel** → **Functions**
3. **Import Function**: Copy code from files
4. **Configure**: Update service URLs if needed
5. **Enable**: Toggle function on
6. **Test**: Try natural language commands

---

## 🚀 Getting Started

### **Quick Start Guide**

#### 1. **Choose Your Path**
- **🎯 New to AI Agents?** → Start with [Cambrian Agent Demo](n8n/Cambrian%20Agent%20Demo.json)
- **🔗 Want Blockchain?** → Try [Sei MCP Demo](n8n/Sei%20MCP%20Demo.json)
- **🤖 Advanced AI?** → Explore [Flowise Agent Templates](#flowise-agent-templates)
- **💬 Chat Interface?** → Install [OpenWebUI Functions](#openwebui-functions)

#### 2. **Import Templates**
- **n8n**: Import JSON files via n8n interface
- **Flowise**: Import JSON via Flowise interface  
- **OpenWebUI**: Copy Python functions to admin panel

#### 3. **Configure Credentials**
- **Required**: OpenAI API key, Sei private key
- **Optional**: Additional AI services (Anthropic, Google)
- **Service-Specific**: Depends on chosen templates

#### 4. **Test & Customize**
- Start with basic templates
- Modify for your specific needs
- Combine multiple templates for complex workflows

### **Resource Usage Patterns**

#### **Portfolio Management**
```
n8n: Sei MCP Demo → Check balances
Flowise: Agent flow → Analyze positions  
OpenWebUI: Cambrian Pipe → "Rebalance my portfolio"
```

#### **Trading Automation**
```
n8n: Multi-Agent System → Coordinate trading agents
Flowise: Custom flows → Execute strategies
OpenWebUI: N8N Pipe → "Execute my DCA strategy"
```

#### **Research & Analysis**
```
n8n: Custom workflows → Data gathering
Flowise: Analysis agents → Process information
OpenWebUI: Eliza Pipe → "Analyze BTC market sentiment"
```

## 📊 Resource Statistics

| Category | Count | Total Size | Complexity |
|----------|-------|------------|------------|
| **n8n Templates** | 10 | ~260KB | Beginner to Advanced |
| **Flowise Templates** | 1 | ~21KB | Intermediate |
| **OpenWebUI Functions** | 4 | ~25KB | Beginner |
| **Documentation** | 1 | ~5KB | Reference |
| **Total Resources** | **16** | **~311KB** | **All Levels** |

## 🎯 Use Case Examples

### **DeFi Automation**
- **Templates**: Cambrian Demo, Sei MCP Agent, Custom Nodes
- **Functions**: Cambrian Pipe, N8N Pipe
- **Capabilities**: Automated trading, yield farming, portfolio rebalancing

### **Conversational Agents**
- **Templates**: Eliza Demo, MCP Agent, Flowise Demo
- **Functions**: Eliza Pipe, Flowise Pipe
- **Capabilities**: Natural language blockchain operations

### **Multi-Agent Systems**
- **Templates**: Multi-Agent System, Full Demo
- **Functions**: All pipes for coordination
- **Capabilities**: Complex workflow orchestration

### **API Development**
- **Templates**: Custom MCP Server, Sei Nodes Demo
- **Functions**: Custom integrations
- **Capabilities**: Blockchain API services

## 🔗 Related Documentation

### **Setup Guides**
- **[Main README](../README.md)** - Complete project overview
- **[Quick Start](../packages/seiling-buidlbox-docs/docs/getting-started/quick-start.md)** - Get running in 5 minutes
- **[Services Overview](../packages/seiling-buidlbox-docs/docs/services/overview.md)** - All service documentation

### **Service-Specific Guides**
- **[n8n Service Guide](../packages/seiling-buidlbox-docs/docs/services/n8n.md)** - Complete n8n documentation
- **[Flowise Service Guide](../packages/seiling-buidlbox-docs/docs/services/flowise.md)** - Agent building guide
- **[OpenWebUI Service Guide](../packages/seiling-buidlbox-docs/docs/services/openwebui.md)** - Chat interface guide
- **[Sei MCP Server Guide](../packages/seiling-buidlbox-docs/docs/services/sei-mcp.md)** - Blockchain tools documentation

### **Advanced Resources**
- **[Custom n8n Nodes](../packages/seiling-buidlbox-docs/docs/resources/sei-n8n-nodes.md)** - Blockchain node development
- **[External Resources](../packages/seiling-buidlbox-docs/docs/resources/external-resources.md)** - Official documentation links

## 🤝 Contributing Resources

Have a useful template or function? Share it with the community:

### **Template Contribution**
1. **Test Thoroughly**: Ensure it works across different environments
2. **Document**: Add clear description and setup instructions
3. **Clean**: Remove personal data and credentials
4. **Submit**: Create pull request with template and documentation

### **Quality Guidelines**
- **Documentation**: Clear setup and usage instructions
- **Error Handling**: Robust error management
- **Security**: No hardcoded credentials or sensitive data
- **Modularity**: Easy to customize and extend

---

**All resources are production-tested and ready to use.** Start with the basic templates and build up to complex multi-agent systems as you become familiar with the platform.

**🚀 Ready to start building?** Pick a template and deploy your first AI agent in minutes!
