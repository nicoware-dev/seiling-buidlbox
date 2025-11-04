#!/bin/bash

# Seiling Auditor Startup Script

echo "🚀 Starting Seiling Auditor..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOF
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3003"
# Add your AI API key below:
# OPENAI_API_KEY="sk-your-key-here"
# OR
# ANTHROPIC_API_KEY="sk-ant-your-key-here"
EOF
    echo "✅ Created .env file. Please add your AI API key!"
fi

# Check if database exists
if [ ! -f prisma/dev.db ]; then
    echo "📦 Setting up database..."
    npx prisma generate
    npx prisma migrate dev --name init
fi

# Check Docker services
echo "🐳 Checking Docker services..."
cd ../..
if docker ps --filter "name=seiling-auditor-slither" --format "{{.Names}}" | grep -q "seiling-auditor-slither"; then
    echo "✅ Slither container is running"
else
    echo "⚠️  Starting Docker services..."
    docker-compose -f docker/services/docker-compose.auditor.yml up -d
fi

cd packages/seiling-auditor

# Start the application
echo "🌐 Starting Next.js application..."
echo ""
echo "📍 Application will be available at: http://localhost:3003"
echo ""
npm run dev

