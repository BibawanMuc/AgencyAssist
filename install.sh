#!/bin/bash

# Configuration
APP_NAME="px-aissitent-app"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting installation for $APP_NAME..."

# 1. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ .env file found."

# 2. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed."
    exit 1
fi

# 3. Check for Docker Compose
if ! command -v docker-compose &> /dev/null; then
    if ! docker compose version &> /dev/null; then
        echo "❌ Error: Docker Compose is not installed."
        exit 1
    fi
fi

# 4. Set permissions
chmod +x install.sh

# 5. Check for Docker Compose file
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    echo "❌ Error: $DOCKER_COMPOSE_FILE not found!"
    echo "Please ensure you are in the correct directory and the file exists."
    exit 1
fi

# 6. Cleanup & Build
echo "♻️  Stopping old containers..."

# Force remove the specific container by name to ensure no conflicts exist
docker rm -f $APP_NAME 2>/dev/null || true

# Try 'docker compose' (v2) first, fallback to 'docker-compose' (v1)
if docker compose version &> /dev/null; then
    docker compose -f $DOCKER_COMPOSE_FILE down
    echo "🏗️  Building and starting containers..."
    docker compose -f $DOCKER_COMPOSE_FILE up -d --build
else
    docker-compose -f $DOCKER_COMPOSE_FILE down
    echo "🏗️  Building and starting containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d --build
fi

# Capture exit code of the docker command
DOCKER_EXIT_CODE=$?

# Load env vars to display correct port
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

PORT=${APP_PORT:-3000}

if [ $DOCKER_EXIT_CODE -eq 0 ]; then
    echo "✅ Installation successful!"
    echo "🌐 App is running on localhost:$PORT (mapped to container port 80)"
    echo "🔗 Configure NGINX Proxy Manager to point to: http://$APP_NAME:80"
else
    echo "❌ Installation failed."
    exit 1
fi
