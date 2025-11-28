# 🔗 تحديث الدومين - خطوة خطوة

## الطريقة السهلة (بدون سطر أوامر)

### 1️⃣ الدخول إلى الموقع
```
https://your-vps-ip:5000  (أو IP بدون port إذا استخدمت Nginx)
```

### 2️⃣ تسجيل الدخول كـ Admin
- البريد: `admin@portal`
- كلمة المرور: `admin` (أو كلمة المرور المغيرة)

### 3️⃣ الذهاب إلى Settings
- اضغط على **Settings** (في القائمة اليسرى أو الصفحة الرئيسية)
- ثم اضغط **Appearance Settings**

### 4️⃣ ملء بيانات الدومين
في القسم **Domain & URL Settings**:

**Domain Name:**
```
portal.yourcompany.com
```

**Application URL:**
```
https://portal.yourcompany.com
```

### 5️⃣ حفظ الإعدادات
- اضغط زر **Save** (أسفل الصفحة)
- ستظهر رسالة "Settings saved successfully" ✅

---

## 🔧 إعداد DNS (عند المزود)

### عند GoDaddy:
1. اذهب إلى: GoDaddy → Domains
2. ابحث عن دومينك
3. اضغط: **DNS**
4. أضف سجل `A`:
   - Name: `@` أو `portal`
   - Type: `A`
   - Value: `YOUR_VPS_IP`
   - TTL: `3600`

### عند Namecheap:
1. اذهب إلى: Dashboard → Domain List
2. اضغط: **Manage DNS**
3. أضف:
   - Host: `@` أو `portal`
   - Type: `A Record`
   - Value: `YOUR_VPS_IP`

### عند Cloudflare:
1. اذهب إلى: DNS
2. أضف سجل جديد:
   - Type: `A`
   - Name: `@` أو `portal`
   - IPv4 Address: `YOUR_VPS_IP`
   - Proxied: Off أو On (اختياري)

---

## ⏳ انتظر 15-30 دقيقة

DNS يأخذ وقت للتحديث. جرّب:

```bash
# Linux/Mac
nslookup portal.yourcompany.com
# أو
dig portal.yourcompany.com
```

يجب أن ترى IP server في النتيجة.

---

## ✅ اختبر الدومين

بعد تحديث DNS، افتح:
```
https://portal.yourcompany.com
```

يجب أن يعمل الآن! 🎉

---

## 🔐 SSL/HTTPS (مهم!)

### إذا استخدمت Nginx:

```bash
sudo certbot --nginx -d portal.yourcompany.com
```

اختر: "Redirect HTTP to HTTPS"

### في الـ config:

```nginx
server {
    listen 443 ssl http2;
    server_name portal.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/portal.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.yourcompany.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}

# Redirect HTTP إلى HTTPS
server {
    listen 80;
    server_name portal.yourcompany.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📝 ملخص الخطوات:

1. ✅ أضفت DNS من المزود
2. ✅ دخلت Settings → Appearance Settings
3. ✅ أدخلت الدومين و URL
4. ✅ حفظت الإعدادات
5. ✅ انتظرت 15-30 دقيقة
6. ✅ اختبرت الدومين
7. ✅ ثبت SSL (اختياري لكن موصى به)

---

## 🆘 لم يعمل؟

### التحقق من DNS:
```bash
nslookup portal.yourcompany.com
# يجب أن يظهر IP server
```

### إعادة تشغيل Nginx:
```bash
sudo systemctl restart nginx
sudo nginx -t  # تحقق من الأخطاء
```

### عرض السجلات:
```bash
pm2 logs portal
```

---

**الآن الموقع يعمل على دومينك الخاص!** 🚀
