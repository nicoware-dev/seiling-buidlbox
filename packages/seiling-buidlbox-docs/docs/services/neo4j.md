# Neo4j

> **Graph database for relationships**

Neo4j provides graph database capabilities for modeling complex relationships and network analysis.

## Overview

- **Port**: 7474 (HTTP), 7687 (Bolt)
- **Image**: `neo4j:5.15-community`
- **Purpose**: Graph data and relationship modeling
- **Status**: Enabled by default

## Configuration

### Default Settings
```bash
NEO4J_AUTH=neo4j/seiling123
ENABLE_NEO4J=yes
```

### Access
- **Web Browser**: http://localhost:7474
- **Username**: neo4j
- **Password**: seiling123

## Usage

### Services Using Neo4j
- **ElizaOS**: Relationship mapping
- **Cambrian**: Portfolio analysis
- **Custom Analytics**: Graph queries

### Basic Queries
```cypher
// Check database
MATCH (n) RETURN count(n);

// Create node
CREATE (p:Person {name: 'Alice'});

// Find relationships
MATCH (a)-[r]->(b) RETURN a, r, b LIMIT 10;
```

## Troubleshooting

### Connection Issues
```bash
# Check service status
curl http://localhost:7474

# View logs
docker logs seiling-neo4j --tail=50
```

### Browser Access
1. Open http://localhost:7474
2. Login: neo4j / seiling123
3. Run `:server status` command

---

**Neo4j enables complex relationship analysis.** Useful for advanced analytics and AI memory. 