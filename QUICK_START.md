# البدء السريع - 3 خطوات فقط ⚡

## 🚀 النسخة السريعة جداً:

### الخطوة 1: GitHub
```bash
git remote add origin https://github.com/yourusername/it-service-portal.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

### الخطوة 2: Cloudron
```
1. Dashboard → Install App
2. Select: Import from Git
3. Repository: it-service-portal
4. Add Environment:
   DATABASE_URL = [من PostgreSQL]
   SESSION_SECRET = أي كلمة سرية
   NODE_ENV = production
5. Deploy
```

### الخطوة 3: تحقق
```
اذهب إلى: https://portal.yourcompany.com
الدخول: admin@portal / admin
```

**تمام! 🎉 الموقع يعمل الآن**

---

## 📁 الملفات المهمة:

| الملف | الفائدة |
|------|--------|
| `README.md` | معلومات عامة |
| `DEVELOPMENT.md` | التطوير المحلي |
| `DEPLOYMENT_GUIDE.md` | نظام التشغيل والمواصفات |
| `GITHUB_TO_CLOUDRON.md` | خطوات النشر المفصلة |
| `QUICK_START.md` | هذا الملف - البدء السريع |

---

**اختر ما يناسبك:**
- 🏃 سريع؟ اقرأ هذا (QUICK_START.md)
- 📚 مفصل؟ اقرأ GITHUB_TO_CLOUDRON.md
- 🖥️ نظام تشغيل؟ اقرأ DEPLOYMENT_GUIDE.md
