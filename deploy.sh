#!/bin/bash

# Barfani Railway Deployment Helper Script
# This script helps verify your setup before deploying to Railway

echo "🏔️  Barfani Railway Deployment Helper"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "DEPLOYMENT.md" ]; then
    echo -e "${RED}❌ Error: Please run this script from the barfani root directory${NC}"
    exit 1
fi

echo "✅ Running from correct directory"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
else
    echo -e "${RED}❌ Node.js version too old. Need v18+, found: $(node -v)${NC}"
    exit 1
fi
echo ""

# Check if git initialized
echo "Checking Git status..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git repository initialized${NC}"

    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
        echo "   Run: git add . && git commit -m 'Ready for deployment'"
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Git not initialized. Run: git init${NC}"
fi
echo ""

# Check backend dependencies
echo "Checking backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Installing backend dependencies...${NC}"
        npm install
    fi
else
    echo -e "${RED}❌ backend/package.json not found${NC}"
    exit 1
fi
cd ..
echo ""

# Check frontend dependencies
echo "Checking frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
        npm install
    fi
else
    echo -e "${RED}❌ frontend/package.json not found${NC}"
    exit 1
fi
cd ..
echo ""

# Check for sensitive files in git
echo "Checking for sensitive files..."
SENSITIVE_FILES=0

if git ls-files | grep -q "\.env$"; then
    echo -e "${RED}❌ .env file is tracked by git!${NC}"
    echo "   Run: git rm --cached backend/.env"
    SENSITIVE_FILES=1
fi

if git ls-files | grep -q "\.env\.local$"; then
    echo -e "${RED}❌ .env.local file is tracked by git!${NC}"
    echo "   Run: git rm --cached frontend/.env.local"
    SENSITIVE_FILES=1
fi

if [ $SENSITIVE_FILES -eq 0 ]; then
    echo -e "${GREEN}✅ No sensitive files in git${NC}"
fi
echo ""

# Check Railway CLI
echo "Checking Railway CLI..."
if command -v railway &> /dev/null; then
    echo -e "${GREEN}✅ Railway CLI installed${NC}"
else
    echo -e "${YELLOW}⚠️  Railway CLI not installed (optional)${NC}"
    echo "   Install: npm i -g @railway/cli"
fi
echo ""

# Summary
echo "======================================"
echo "📋 Deployment Checklist:"
echo ""
echo "1. ✅ Code is ready"
echo "2. 📚 Read DEPLOYMENT.md for detailed instructions"
echo "3. 🌐 Push code to GitHub"
echo "4. 🚂 Go to railway.app and deploy!"
echo ""
echo "Quick links:"
echo "- Railway Dashboard: https://railway.app/dashboard"
echo "- Deployment Guide: ./DEPLOYMENT.md"
echo "- Checklist: ./DEPLOYMENT_CHECKLIST.md"
echo ""
echo -e "${GREEN}Ready for deployment! 🚀${NC}"
