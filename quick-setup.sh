#!/bin/bash

# IT Service Portal - One-Command Setup
# استخدام: bash quick-setup.sh

set -e

echo "======================================"
echo "🚀 IT Service Portal - Complete Setup"
echo "======================================"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed!"
    echo "Install: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
    exit 1
fi

echo "✅ Node.js $(node -v)"
echo ""

# Download
INSTALL_DIR="${1:-.}/portal"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "📥 Downloading project..."
if ! curl -L -o app.zip https://github.com/Riydx0/portal-RH2/archive/refs/heads/main.zip 2>/dev/null; then
    echo "Using wget..."
    wget -q -O app.zip https://github.com/Riydx0/portal-RH2/archive/refs/heads/main.zip
fi

# Extract
echo "📂 Extracting..."
unzip -q app.zip
rm app.zip

# Move files
if [ -d "portal-RH2-main" ]; then
    mv portal-RH2-main/* .
    rm -rf portal-RH2-main
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo "📊 Setting up database..."
npm run db:push

echo ""
echo "======================================"
echo "✅ SETUP COMPLETE!"
echo "======================================"
echo ""
echo "📍 Location: $(pwd)"
echo ""
echo "▶️  START APPLICATION:"
echo "   npm run dev"
echo ""
echo "🌐 OPEN IN BROWSER:"
echo "   http://localhost:5000"
echo ""
echo "👤 LOGIN:"
echo "   Email: admin@portal"
echo "   Password: admin"
echo ""
echo "⚠️  Change admin password immediately!"
echo ""
echo "======================================"
