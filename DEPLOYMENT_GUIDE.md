# دليل الاستضافة والتطوير - IT Service Portal

## 🖥️ نظام التشغيل المناسب

### **الأفضل للـ Production:**

#### 1. Linux (Ubuntu 22.04 LTS) ⭐⭐⭐⭐⭐
- **التوصية:** الخيار الأول والأفضل
- **الأسباب:**
  - استقرار عالي جداً
  - أداء أعلى من Windows
  - توفر أمان أعلى
  - دعم طويل الأمد (5 سنوات)
  - توفر تكاليف (أرخص من Windows)

#### 2. Ubuntu Server 20.04/22.04 LTS ✅
```bash
# التثبيت على VPS
1. اطلب Ubuntu 22.04 LTS من provider
2. SSH إلى السيرفر
3. اتبع الخطوات في القسم "خطوات البدء"
```

#### 3. CentOS / RHEL ✅
- بديل جيد إذا كان متاح
- نفس الأداء تقريباً
- شركات Enterprise تفضله

#### 4. Windows Server ⚠️
```
❌ لا ننصح به:
- استهلاك موارد أعلى
- أغلى من Linux
- أبطأ قليلاً
- (فقط إذا كان عندك خبرة و infrastructure Windows)
```

---

## 📊 المواصفات المطلوبة

### **للمرحلة الأولى (البدء):**

| المكون | الحد الأدنى | الموصى به |
|------|-----------|---------|
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 1 GB | 2 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **Bandwidth** | 100 GB/شهر | 500 GB/شهر |
| **Users** | حتى 100 | حتى 500 |

### **للمرحلة الثانية (نمو):**

| المكون | المرحلة 2 | المرحلة 3 |
|------|---------|---------|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 100 GB SSD | 200+ GB SSD |
| **Database** | PostgreSQL 13+ | PostgreSQL 14+ Cluster |
| **Users** | 500-2,000 | 2,000-10,000+ |

---

## 🚀 خطوات البدء على Linux

### **1. تثبيت المتطلبات:**

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# تثبيت Git
sudo apt install -y git

# تثبيت PM2 (لإدارة التطبيق)
sudo npm install -g pm2

# تثبيت Nginx (كـ reverse proxy)
sudo apt install -y nginx
```

### **2. إعداد قاعدة البيانات:**

```bash
# بدء PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# إنشاء مستخدم جديد
sudo -u postgres psql
CREATE USER app_user WITH PASSWORD 'secure_password';
CREATE DATABASE it_portal OWNER app_user;
```

### **3. استنساخ المشروع:**

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/it-service-portal.git
cd it-service-portal
npm install
```

### **4. إعداد Environment:**

```bash
# نسخ ملف الـ environment
cat > .env << EOF
DATABASE_URL=postgresql://app_user:secure_password@localhost:5432/it_portal
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourcompany.com
SMTP_SECURE=false
EOF
```

### **5. بناء التطبيق:**

```bash
npm run build
```

### **6. تشغيل مع PM2:**

```bash
pm2 start "npm run start" --name "it-portal"
pm2 startup
pm2 save
```

---

## 🐳 هل ننصح بـ Docker؟

### **الإجابة المختصرة:**

```
الآن: ❌ لا تحتاج Docker
المستقبل (عندما تكبر): ✅ نعم، Docker مفيد
```

### **المقارنة:**

| المعيار | بدون Docker | مع Docker |
|------|-----------|----------|
| **التعقيد** | بسيط | متوسط |
| **الإعداد** | سهل | يحتاج وقت |
| **التطوير** | سريع | أسرع للـ Team |
| **التطبيق** | سهل | يحتاج Kubernetes |
| **الأداء** | ممتاز | ممتاز |
| **التكاليف** | منخفضة | متوسطة-عالية |

---

## 📈 خطة التطور:

### **المرحلة 1: البدء (الآن) 🟢**
```
- خادم واحد (Ubuntu VPS)
- PostgreSQL محلي
- بدون Docker
- Nginx كـ reverse proxy
- السعر: $10-20/شهر
```

### **المرحلة 2: النمو (بعد 6 أشهر) 🟡**
```
- 2-3 خوادم للـ load balancing
- PostgreSQL منفصل
- بدء استخدام Docker
- Redis للـ caching
- CDN للملفات الثابتة
- السعر: $50-100/شهر
```

### **المرحلة 3: الإنتاج (بعد سنة) 🔴**
```
- Kubernetes (Docker Orchestration)
- أكثر من 5 خوادم
- Database Cluster
- Microservices
- CI/CD Pipeline متقدم
- السعر: $200-500+/شهر
```

---

## 🐳 متى تستخدم Docker؟

### **استخدم Docker عندما:**

✅ يكون فريقك متعدد الأشخاص  
✅ تحتاج للنشر على أكثر من سيرفر  
✅ تريد عزل البيئات (Development, Testing, Production)  
✅ تخطط للـ Kubernetes أو Docker Swarm  
✅ تحتاج للـ auto-scaling  

### **لا تستخدم Docker عندما:**

❌ أنت الوحيد المطور  
❌ المشروع صغير (<100 مستخدم)  
❌ فريقك غير معتاد على Docker  
❌ تريد بدء سريع بدون تعقيد  

---

## 🔧 Dockerfile (للمستقبل)

عندما تقرر استخدام Docker، استخدم هذا:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# نسخ package.json
COPY package*.json ./
RUN npm ci --only=production

# نسخ الكود
COPY . .

# بناء التطبيق
RUN npm run build

# فتح المنفذ
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "run", "start"]
```

### **docker-compose.yml:**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/it_portal
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=app_user
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=it_portal
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🎯 التوصيات النهائية:

### **للبدء الآن (المرحلة 1):**
1. ✅ استخدم **Ubuntu 22.04 LTS VPS** ($10-20/شهر)
2. ✅ **بدون Docker** - إعداد مباشر على الخادم
3. ✅ استخدم **PM2** لإدارة التطبيق
4. ✅ استخدم **Nginx** كـ reverse proxy
5. ✅ **LetsEncrypt** للـ SSL (مجاني)

### **بعد 6 أشهر (عندما تكبر):**
1. 🔄 فكّر في Docker للـ scalability
2. 🔄 أضف Redis للـ caching
3. 🔄 استخدم CDN للملفات الثابتة
4. 🔄 أنشئ CI/CD pipeline

### **بعد سنة (Production Scale):**
1. 🚀 استخدم Kubernetes
2. 🚀 Multi-region deployment
3. 🚀 Auto-scaling
4. 🚀 Advanced monitoring

---

## 💡 نصيحة ذهبية:

> **ابدأ بـ Simple ثم طوّر!**
> 
> لا تعقّد المشروع من الأول. عندما تحتاج فعلاً Docker أو Kubernetes، ستعرف ذلك من استخدام الموقع وليس من التنظير.

---

**آخر تحديث:** November 26, 2025  
**الإصدار:** v0.1.0
