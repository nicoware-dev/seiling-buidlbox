# Seiling Buidlbox Documentation Site

This package provides the official Docusaurus documentation site for the Seiling Buidlbox project.

> For information about the main Seiling Buidlbox project, see the [main project README](../../README.md).

## 📚 Overview

- **Purpose**: Centralized documentation using Docusaurus
- **Status**: Active development
- **Deployment**: Static site generation with React
- **Integration**: Self-hosted or deployable to any static hosting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Navigate to docs directory**:
   ```bash
   cd packages/seiling-buidlbox-docs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

4. **Access documentation**:
   - Local: http://localhost:3000
   - Live reload enabled for development

## 📁 Structure

```
seiling-buidlbox-docs/
├── README.md                 # This file
├── package.json             # Dependencies and scripts
├── docusaurus.config.js     # Docusaurus configuration
├── sidebars.js              # Navigation sidebar configuration
├── docs/                    # Documentation content
│   ├── intro.md            # Homepage content
│   ├── getting-started/    # Getting started guides
│   ├── guides/             # User guides and tutorials
│   │   ├── troubleshooting.md
│   │   └── resources.md
│   ├── reference/          # Reference documentation
│   │   └── ux-design.md
│   └── config/             # Configuration guides
├── src/                    # Custom React components
│   ├── css/               # Custom styling
│   └── pages/             # Custom pages
├── static/                # Static assets (images, files)
│   └── img/               # Images and icons
└── build/                 # Generated static site (after build)
```

## 🔧 Configuration

### docusaurus.config.js
The main configuration file controls:
- Site metadata and SEO
- Navigation and sidebar
- Plugins and themes
- Deployment settings

### sidebars.js
Defines the documentation navigation structure:
- Getting started guides
- User guides and tutorials
- Reference documentation
- Configuration guides

## 🛠️ Development

### Available Scripts

```bash
# Start development server with live reload
npm start

# Build static site for production
npm run build

# Serve built site locally
npm run serve

# Deploy to GitHub Pages (if configured)
npm run deploy

# Clear Docusaurus cache
npm run clear
```

### Writing Documentation

1. **Create new pages**: Add `.md` files in the `docs/` directory
2. **Update navigation**: Edit `sidebars.js` to include new pages
3. **Add images**: Place in `static/img/` and reference with `/img/filename`
4. **Use Docusaurus features**: Admonitions, code blocks, tabs, etc.

### Content Guidelines

- Use clear, concise language
- Include code examples where relevant
- Add troubleshooting sections for complex topics
- Use Docusaurus admonitions (:::tip, :::warning, etc.)
- Include cross-references to related documentation

## 📦 Docker Integration

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build documentation
RUN npm run build

# Serve with simple HTTP server
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
```

### Docker Compose Service
Add to main project's `docker-compose.yml`:
```yaml
seiling-docs:
  build:
    context: ./packages/seiling-buidlbox-docs
    dockerfile: Dockerfile
  container_name: seiling-docs
  restart: unless-stopped
  ports:
    - "${DOCS_PORT:-4000}:3000"
  networks:
    - seiling_network
```

## 🚀 Deployment

### Static Hosting Options

**Vercel** (Recommended):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build
vercel --prod
```

**Netlify**:
```bash
# Build command: npm run build
# Publish directory: build
```

**GitHub Pages**:
```bash
# Configure in docusaurus.config.js
npm run deploy
```

### Self-Hosted

```bash
# Build for production
npm run build

# Serve with any static file server
npx serve build
# or upload build/ directory to your web server
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths: ['packages/seiling-buidlbox-docs/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: packages/seiling-buidlbox-docs/package-lock.json
          
      - name: Install dependencies
        run: |
          cd packages/seiling-buidlbox-docs
          npm ci
          
      - name: Build documentation
        run: |
          cd packages/seiling-buidlbox-docs
          npm run build
          
      - name: Deploy to hosting
        # Add your deployment step here
        run: echo "Deploy to your preferred hosting service"
```

## 📋 Content Checklist

### Current Documentation
- [x] Introduction and overview
- [x] Troubleshooting guide
- [x] Resources and examples guide
- [x] UX design reference
- [ ] Getting started tutorial
- [ ] API reference documentation
- [ ] Configuration guides
- [ ] Advanced usage patterns

### Planned Additions
- [ ] Video tutorials and demos
- [ ] Interactive examples
- [ ] Community contributions guide
- [ ] Migration guides
- [ ] Performance optimization guide
- [ ] Security best practices

## 🎨 Customization

### Theming
- Edit `src/css/custom.css` for styling
- Customize colors, fonts, and layout
- Add custom React components in `src/components/`

### Features
- Search functionality (enabled by default)
- Dark/light mode toggle
- Mobile-responsive design
- SEO optimization
- Social media integration

## 📝 Contributing

### Documentation Contributions

1. **Fork the repository**
2. **Create documentation branch**: `git checkout -b docs/feature-name`
3. **Make changes** in the `docs/` directory
4. **Test locally**: `npm start`
5. **Build to verify**: `npm run build`
6. **Submit pull request**

### Content Standards

- Follow existing documentation structure
- Include examples and code snippets
- Add screenshots for UI-related content
- Update navigation in `sidebars.js` if needed
- Test all links and references

## 🔗 Links

- **Development Server**: http://localhost:3000
- **Main Project**: [Seiling Buidlbox](../../README.md)
- **Docusaurus Documentation**: https://docusaurus.io/docs

## 🐛 Troubleshooting

### Common Issues

**Build Failures**:
```bash
# Clear cache and rebuild
npm run clear
npm run build
```

**Development Server Issues**:
```bash
# Check port availability
lsof -i :3000

# Use different port
npm start -- --port 3001
```

**Node Version Issues**:
```bash
# Use Node 18+
node --version

# Update if needed
nvm use 18
```

---

**Docusaurus Documentation Site** - Official documentation for the Seiling Buidlbox project

> **Note**: This documentation site is part of the Seiling Buidlbox hackathon project. For production use, review and update content as needed. 