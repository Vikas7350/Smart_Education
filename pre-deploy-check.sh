#!/bin/bash
# Pre-Deployment Checklist

echo "🔍 Checking deployment readiness..."
echo ""

# Check git
if [ -d .git ]; then
    echo "✅ Git initialized"
else
    echo "⚠️  Git not initialized - run: git init"
fi

# Check backend files
if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json exists"
else
    echo "❌ Backend package.json missing"
fi

if [ -f "backend/server.js" ]; then
    echo "✅ Backend server.js exists"
else
    echo "❌ Backend server.js missing"
fi

# Check frontend files
if [ -f "frontend/package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

if [ -f "frontend/next.config.js" ]; then
    echo "✅ Frontend next.config.js exists"
else
    echo "❌ Frontend next.config.js missing"
fi

# Check environment variables
echo ""
echo "🔐 Environment Variables:"

if [ -f "backend/.env" ]; then
    echo "✅ Backend .env file exists"
else
    echo "⚠️  Backend .env not found - needed for deployment"
fi

if [ -f "frontend/.env.local" ]; then
    echo "✅ Frontend .env.local exists"
    if grep -q "NEXT_PUBLIC_API_URL" "frontend/.env.local"; then
        echo "  ✅ NEXT_PUBLIC_API_URL is set"
    else
        echo "  ❌ NEXT_PUBLIC_API_URL not set"
    fi
else
    echo "⚠️  Frontend .env.local not found"
fi

echo ""
echo "📝 Deployment Steps:"
echo "1. Push to GitHub: git push -u origin main"
echo "2. Deploy backend to Render"
echo "3. Deploy frontend to Vercel"
echo "4. Test both services"
echo ""
echo "📖 Full guide: See DEPLOYMENT_GUIDE.md"
