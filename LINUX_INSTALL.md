# 🐧 تثبيت بسيط على Linux

## الطريقة السريعة جداً (5 دقائق)

### الخطوة 1️⃣: استنساخ المشروع

```bash
git clone https://github.com/YOUR-USERNAME/portal-RH2.git
cd portal-RH2
```

### الخطوة 2️⃣: تشغيل سكريبت التثبيت

```bash
bash install.sh
```

هذا السكريبت سيفعل كل شيء تلقائياً:
- ✅ تثبيت المتطلبات
- ✅ إنشاء ملف `.env`
- ✅ بناء المشروع
- ✅ تهيئة قاعدة البيانات

### الخطوة 3️⃣: تشغيل البرنامج

```bash
npm run dev
```

### الخطوة 4️⃣: فتح التطبيق

افتح المتصفح وذهب إلى:
```
http://localhost:5000
```

**تسجيل الدخول:**
- البريد: `admin@portal`
- كلمة المرور: `admin`

---

## ⚠️ المتطلبات الأساسية

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib

# Or just Node.js (استخدم PostgreSQL موجود أو Neon)
sudo apt install -y nodejs npm
```

---

## 🔧 إعداد PostgreSQL (اختياري)

إذا اخترت تثبيت PostgreSQL محلياً:

```bash
# بدء الخدمة
sudo systemctl start postgresql
sudo systemctl enable postgresql

# إنشاء قاعدة بيانات
sudo -u postgres psql << EOF
CREATE DATABASE portal_db;
\q
EOF
```

---

## 💡 استخدام Neon (موصى به)

بدلاً من PostgreSQL محلي، استخدم Neon (سحابي، مجاني):

1. اذهب إلى: https://neon.tech
2. أنشئ حساب
3. انسخ رابط الاتصال (Connection String)
4. عدّل في `.env`:

```
DATABASE_URL=postgresql://user:password@neon-host.com/portal_db
```

---

## 📝 تعديل ملف `.env`

السكريبت ينشئ `.env` تلقائياً، لكن تأكد من:

```env
# قاعدة البيانات - غيّرها حسب إعدادك
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portal_db

# البريد الإلكتروني (اختياري)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# الباقي لا تغيره
NODE_ENV=development
SESSION_SECRET=[يُنشأ تلقائياً]
```

---

## 🚀 الأوامر المهمة

```bash
# تشغيل البرنامج
npm run dev

# بناء الإنتاج
npm run build

# تشغيل الإنتاج
npm start

# تحديث قاعدة البيانات
npm run db:push

# مسح و إعادة تثبيت
rm -rf node_modules
npm install
```

---

## 🐳 استخدام Docker (اختياري)

```bash
# بناء الصورة
docker build -t portal:latest .

# تشغيل مع PostgreSQL
docker-compose up -d

# إيقاف
docker-compose down
```

---

## ✅ تم! 

البرنامج الآن يعمل محلياً.

### التالي:
1. غيّر كلمة مرور Admin
2. أضف مستخدمين
3. اضبط البريد الإلكتروني

---

## 🐛 استكشاف الأخطاء

### خطأ: "Cannot connect to database"
```bash
# تحقق من DATABASE_URL في .env
# أو استخدم Neon
```

### خطأ: "Node modules not installed"
```bash
npm install
```

### خطأ: "Port 5000 already in use"
```bash
# استخدم port مختلف
PORT=3000 npm run dev
```

---

## 📞 للمساعدة

- **GitHub:** https://github.com/Riydx0/portal-RH2
- **Neon Docs:** https://neon.tech/docs
- **Node.js:** https://nodejs.org

---

**تم! 🎉 البرنامج جاهز للعمل!**
