#!/bin/bash

# IT Service Portal - Linux Installation Script
# استخدام: bash install.sh

set -e

echo "======================================"
echo "IT Service Portal - Linux Setup"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت!"
    echo "اثبت Node.js من: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js: $(node -v)"
echo ""

# Install dependencies
echo "📦 تثبيت المتطلبات..."
npm install
echo "✅ تم تثبيت المتطلبات"
echo ""

# Environment setup
echo "🔧 إعداد متغيرات البيئة..."
echo ""

if [ -f .env ]; then
    read -p "ملف .env موجود. هل تريد الكتابة فوقه؟ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "تم تخطي إعداد البيئة"
        echo ""
    else
        create_env=true
    fi
else
    create_env=true
fi

if [ "$create_env" = true ]; then
    # Generate SESSION_SECRET
    SESSION_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portal_db
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=portal_db

# Session & Security
SESSION_SECRET=$SESSION_SECRET
NODE_ENV=development

# Email Configuration (اختياري)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@yourcompany.com
SMTP_SECURE=false

# Application
VITE_APP_NAME=IT Service Portal
VITE_APP_URL=http://localhost:5000
EOF
    
    echo "✅ تم إنشاء ملف .env"
    echo ""
    echo "⚠️ IMPORTANT:"
    echo "   1. افتح ملف .env وعدّل بيانات PostgreSQL"
    echo "   2. أضف بيانات البريد الإلكتروني إذا لزم الأمر"
    echo ""
fi

# Database check
echo "🗄️ التحقق من PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️ PostgreSQL غير مثبت محلياً"
    echo "   اخيارات:"
    echo "   1. اثبت PostgreSQL: sudo apt install postgresql postgresql-contrib"
    echo "   2. أو استخدم Neon: https://neon.tech (موصى به)"
    echo "   3. عدّل DATABASE_URL في .env"
    echo ""
    read -p "هل تريد المتابعة؟ (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ PostgreSQL مثبت"
fi
echo ""

# Build
echo "🔨 بناء المشروع..."
npm run build
echo "✅ تم البناء بنجاح"
echo ""

# Database migration
echo "📊 تهيئة قاعدة البيانات..."
npm run db:push
echo "✅ تم تهيئة قاعدة البيانات"
echo ""

# Summary
echo "======================================"
echo "✅ التثبيت اكتمل بنجاح!"
echo "======================================"
echo ""
echo "📋 الخطوات التالية:"
echo ""
echo "1. تشغيل التطبيق:"
echo "   npm run dev"
echo ""
echo "2. فتح التطبيق:"
echo "   http://localhost:5000"
echo ""
echo "3. بيانات الدخول الافتراضية:"
echo "   البريد: admin@portal"
echo "   كلمة المرور: admin"
echo ""
echo "⚠️ غيّر بيانات المسؤول فوراً!"
echo ""
echo "======================================"
