/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Main sidebar
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: '🏠 Introduction',
    },
    {
      type: 'category',
      label: '🚀 Getting Started',
      collapsed: false,
      items: [
        'getting-started/quick-start',
        'getting-started/deployment', 
        'getting-started/configuration',
      ],
    },
    {
      type: 'category',
      label: '📚 Resources',
      collapsed: true,
      items: [
        'resources/sei-n8n-nodes',
        'resources/n8n-templates',
        'resources/flowise-templates',
        'resources/openwebui-templates',
        'resources/bootstrap-scripts',
        'resources/external-resources',
      ],
    },
    
    {
      type: 'category',
      label: '⚙️ Services',
      collapsed: true,
      items: [
        'services/overview',
        {
          type: 'category',
          label: '🖥️ User Interfaces',
          collapsed: true,
          items: [
            'services/openwebui',
            'services/n8n',
            'services/flowise',
          ],
        },
        {
          type: 'category', 
          label: '🤖 AI Frameworks',
          collapsed: true,
          items: [
            'services/eliza',
            'services/cambrian',
            'services/sei-mcp',
          ],
        },
        {
          type: 'category',
          label: '🗄️ Databases',
          collapsed: true,
          items: [
            'services/postgres',
            'services/redis',
            'services/qdrant',
            'services/neo4j',
          ],
        },
        {
          type: 'category',
          label: '🚀 Infrastructure',
          collapsed: true,
          items: [
            'services/traefik',
            'services/ollama',
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars; 