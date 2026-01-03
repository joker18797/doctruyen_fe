#!/bin/bash

# Deploy script for doctruyen frontend
# Usage: ./deploy.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PM2_APP_NAME="doctruyen-frontend"

echo -e "${GREEN}🚀 Starting frontend deployment...${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}❌ PM2 is not installed. Installing PM2...${NC}"
    npm install -g pm2
fi

# Step 1: Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest code from git...${NC}"
    git pull origin main || git pull origin master || echo "⚠️  Git pull failed or not a git repo, continuing..."
fi

# Step 2: Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
if [ -f "package-lock.json" ]; then
    npm ci --production=false
elif [ -f "yarn.lock" ]; then
    yarn install
else
    npm install
fi

# Step 3: Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# Step 4: Stop existing PM2 process
echo -e "${YELLOW}🛑 Stopping existing PM2 process...${NC}"
pm2 stop "$PM2_APP_NAME" 2>/dev/null || echo "No existing process to stop"
pm2 delete "$PM2_APP_NAME" 2>/dev/null || echo "No existing process to delete"

# Step 5: Start with PM2 using ecosystem file
echo -e "${YELLOW}▶️  Starting frontend with PM2...${NC}"
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    echo -e "${RED}❌ ecosystem.config.js not found!${NC}"
    exit 1
fi

# Step 6: Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save

# Step 7: Show status
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${GREEN}📊 PM2 Status:${NC}"
pm2 status

echo -e "${GREEN}📝 View logs with: pm2 logs $PM2_APP_NAME${NC}"
echo -e "${GREEN}📊 Monitor with: pm2 monit${NC}"

