# دليل النشر من GitHub إلى Cloudron 🚀

## المسار الكامل:
```
GitHub → Cloudron → التطبيق يعمل على الإنترنت
```

---

## 🟢 الخطوة 1: إعداد GitHub (مرة واحدة فقط)

### 1.1 إنشاء Repository جديد:
```
1. اذهب إلى https://github.com/new
2. اكتب اسم المستودع: it-service-portal
3. اختر: Private (خاص) أو Public (عام)
4. لا تختر "Add README" (عندك واحد بالفعل)
5. اضغط "Create repository"
```

### 1.2 نسخ URL المستودع:
```
الصفحة ستعطيك URL مثل:
https://github.com/yourusername/it-service-portal.git
```

### 1.3 رفع المشروع الأول:
افتح Terminal وشغّل:

```bash
cd /path/to/your/project

# ربط المستودع الجديد
git remote add origin https://github.com/yourusername/it-service-portal.git
git branch -M main

# رفع كل الملفات
git add .
git commit -m "feat: Initial commit - IT Service Portal v0.1.0"
git push -u origin main
```

**تم!** 🎉 المشروع الآن على GitHub

---

## 🟡 الخطوة 2: إعداد Cloudron

### 2.1 إنشاء حساب Cloudron:
```
1. اذهب إلى https://www.cloudron.io/
2. اختر خادم (VPS provider)
3. أنشئ حساب واتبع التعليمات
4. بعد الإعداد، ستدخل Cloudron Dashboard
```

### 2.2 إنشاء Personal Access Token في GitHub:
```
1. اذهب إلى GitHub Settings
   https://github.com/settings/profile
2. اختر "Developer settings" من الشريط الجانبي
3. اختر "Personal access tokens"
4. اضغط "Generate new token (classic)"
5. اختر الصلاحيات (Scopes):
   ✅ repo (كل شيء)
   ✅ workflow
6. اضغط "Generate token"
7. انسخ الـ token (لن يظهر مرة ثانية!)
```

### 2.3 إضافة GitHub في Cloudron:
```
1. في Cloudron Dashboard، اذهب إلى الإعدادات
2. ابحث عن "Git" أو "GitHub"
3. اضغط "Connect to GitHub"
4. الصق الـ Token اللي نسخته
5. اضغط "Save"
```

---

## 🔵 الخطوة 3: إعداد قاعدة البيانات في Cloudron

### 3.1 إنشاء PostgreSQL:
```
1. في Cloudron Dashboard، اذهب إلى "Services"
2. اختر "PostgreSQL" أو Database
3. اضغط "Install" أو "New Service"
4. الخيارات الافتراضية تمام
5. اضغط "Install"
6. انتظر 2-3 دقائق حتى ينتهي
```

### 3.2 الحصول على Connection String:
```
1. بعد التثبيت، اضغط على PostgreSQL
2. ستجد "Connection String" أو "DATABASE_URL"
3. مثال:
   postgresql://user:password@postgres:5432/it_portal
4. انسخها بأمان
```

---

## 🔴 الخطوة 4: إعداد التطبيق في Cloudron

### 4.1 إضافة Web App جديد:
```
1. في Cloudron Dashboard، اضغط "Install App" أو "+"
2. ابحث عن "Custom App" أو "Node.js"
3. أو اختر "Import from Git"
4. اختر Repository: it-service-portal
5. اختر Branch: main
```

### 4.2 إعداد الإعدادات:

**البيانات التالية:**
```
اسم التطبيق: IT Service Portal
Domain: portal.yourcompany.com (أو أي domain تملكه)
Port: 5000
Build Command: npm install && npm run build
Start Command: npm run start
```

### 4.3 إضافة متغيرات البيئة:
اضغط على "Environment Variables" وأضيف:

```
DATABASE_URL=postgresql://user:password@postgres:5432/it_portal
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourcompany.com
SMTP_SECURE=false
```

### 4.4 اضغط "Deploy" أو "Install":
```
1. Cloudron سيسحب الكود من GitHub
2. سيعدّي البيئة
3. سيبني التطبيق (npm run build)
4. سيشغّل التطبيق (npm run start)
5. انتظر 5-10 دقائق
```

---

## ✅ الخطوة 5: التحقق من التشغيل

### 5.1 فتح الموقع:
```
اذهب إلى:
https://portal.yourcompany.com
(أو الـ domain اللي اخترته)
```

### 5.2 الدخول:
```
البريد: admin@portal
كلمة المرور: admin
```

### 5.3 اختبار المميزات:
```
✅ تسجيل الدخول
✅ الدخول للـ Dashboard
✅ التنقل بين الصفحات
✅ اللغة (عربي/إنجليزي)
```

---

## 🔄 الخطوة 6: التحديثات المستمرة

### كل مرة تعدّل الكود:

#### 1️⃣ حفظ محلياً:
```bash
# في Replit أو جهازك
git add .
git commit -m "feat: وصف التحديث"
git push origin main
```

#### 2️⃣ Cloudron سيتحدث تلقائياً:
```
Cloudron يراقب GitHub
عندما تعدّل main branch
يسحب التحديثات تلقائياً
يبني ويشغّل النسخة الجديدة
```

#### 3️⃣ تحقق من التحديث:
```
الموقع سيتحدث في دقيقة أو دقيقتين
لا حاجة لعمل أي شيء يدوي
```

---

## 📋 قائمة التحقق الكاملة:

```
GitHub Setup:
☑️ Repository مُنشأ على GitHub
☑️ Commit أول رُفع بنجاح
☑️ Personal Access Token مُنشأ

Cloudron Setup:
☑️ حساب Cloudron جاهز
☑️ GitHub متصل بـ Cloudron
☑️ PostgreSQL مُثبّت

App Deployment:
☑️ Web App تم إضافتها
☑️ متغيرات البيئة مضبوطة
☑️ Build و Start Commands صحيحة
☑️ التطبيق يعمل

Testing:
☑️ الموقع يفتح بدون أخطاء
☑️ الدخول يعمل (admin@portal / admin)
☑️ Dashboard يظهر
☑️ البيانات تُحفظ
```

---

## 🆘 استكشاف الأخطاء الشائعة:

### المشكلة: "Build Failed"
```bash
الحل:
1. تحقق من npm install يعمل محلياً
2. تحقق من package.json صحيح
3. تحقق من لا توجد أخطاء TypeScript

npm run check
```

### المشكلة: "Cannot connect to database"
```bash
الحل:
1. تحقق من DATABASE_URL صحيحة في Cloudron
2. تحقق من PostgreSQL يعمل
3. جرّب الـ connection string محلياً

psql "postgresql://user:pass@host:5432/db"
```

### المشكلة: "Port already in use"
```bash
الحل:
1. غيّر Port في Cloudron من 5000 لـ 3000
2. أو أعد تشغيل الـ container
```

### المشكلة: "Domain not working"
```bash
الحل:
1. تأكد أن Domain يشير للـ Cloudron IP
2. انتظر 24 ساعة لـ DNS propagation
3. جرّب مع IP الـ server مباشرة
```

---

## 🎯 الخطوات المختصرة (نسخة سريعة):

```
1. GitHub:
   - New repo
   - git push

2. Cloudron:
   - Connect GitHub
   - Add App
   - Set Env Vars
   - Deploy

3. Done! 🎉
   - الموقع يعمل
   - Auto-updates من GitHub
```

---

## 📊 الجدول الزمني:

| الخطوة | الوقت | الصعوبة |
|------|------|--------|
| GitHub Setup | 5 دقائق | سهل ✅ |
| Cloudron Setup | 15 دقيقة | متوسط 🟡 |
| Database | 5 دقائق | سهل ✅ |
| App Deploy | 10 دقائق | متوسط 🟡 |
| Testing | 5 دقائق | سهل ✅ |
| **المجموع** | **40 دقيقة** | **جاهز 🚀** |

---

## ✨ تهانينا! 🎉

الموقع الآن على الإنترنت وقابل للوصول من أي مكان في العالم!

**التالي:**
- إضافة مزيد من الميزات
- تطويره المستمر
- كل تحديث ينشر تلقائياً من GitHub

---

**آخر تحديث:** November 26, 2025  
**الإصدار:** v0.1.0  
**الحالة:** جاهز للـ Production 🚀
