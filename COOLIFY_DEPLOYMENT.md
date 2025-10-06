# دليل نشر التطبيق على Coolify

## نظرة عامة

هذا الدليل يشرح كيفية نشر تطبيق Student Plan Form على Coolify وربطه بـ subdomain.

---

## المتطلبات الأساسية

- حساب على Coolify أو تثبيت Coolify على خادمك
- Domain أو Subdomain متاح
- Git repository (اختياري)

---

## الطريقة 1: النشر من Git Repository

### الخطوة 1: رفع الكود على Git

```bash
# إذا لم يكن لديك repository بعد
git init
git add .
git commit -m "Initial commit: Student Plan Form"
git remote add origin https://github.com/your-username/student-plan-form.git
git push -u origin main
```

### الخطوة 2: إضافة التطبيق في Coolify

1. افتح Coolify Dashboard
2. اختر Project أو أنشئ واحداً جديداً
3. اضغط **Add New Resource**
4. اختر **Application**

### الخطوة 3: إعدادات Git

1. **Source Type:** Git Repository
2. **Repository URL:** `https://github.com/your-username/student-plan-form.git`
3. **Branch:** main (أو master)
4. **Build Pack:** Nixpacks أو Docker (اختر Nixpacks للسهولة)

### الخطوة 4: إعدادات البناء

في **Build Configuration:**

```yaml
# Build Command
npm install && npm run build

# Start Command
npx serve -s dist -p 3000

# أو يمكنك استخدام preview من vite
# npm run preview

# Install Command (إذا طُلب منك)
npm install
```

### الخطوة 5: إعدادات Environment Variables

أضف المتغيرات التالية في **Environment Variables:**

```
NODE_ENV=production
PORT=3000
```

**ملاحظة:** لا تحتاج لإضافة `GOOGLE_APPS_SCRIPT_URL` و `N8N_WEBHOOK_URL` هنا لأنهما موجودان في الكود مباشرة.

### الخطوة 6: إعدادات Port

1. **Port:** 3000
2. **Health Check Path:** / (اختياري)

---

## الطريقة 2: النشر من Docker Image

### إنشاء Dockerfile

أنشئ ملف `Dockerfile` في جذر المشروع:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### بناء ورفع الـ Image

```bash
# Build the image
docker build -t student-plan-form:latest .

# إذا كنت تريد رفعها على Docker Hub
docker tag student-plan-form:latest your-username/student-plan-form:latest
docker push your-username/student-plan-form:latest
```

### إضافة التطبيق في Coolify

1. اختر **Docker Image** كـ Source Type
2. **Image:** `your-username/student-plan-form:latest`
3. **Port:** 3000

---

## إعداد Domain/Subdomain

### الخطوة 1: إضافة Domain في Coolify

1. في إعدادات التطبيق، اذهب إلى **Domains**
2. اضغط **Add Domain**
3. أدخل الـ Domain أو Subdomain:
   - مثال: `student-plan.yourdomain.com`
   - أو: `plan.example.com`

### الخطوة 2: إعداد DNS

في إعدادات الـ DNS الخاص بك (مثل Cloudflare, Namecheap, etc):

#### إذا كنت تستخدم Subdomain:

أضف A Record:
```
Type: A
Name: student-plan (أو plan)
Value: IP_ADDRESS_OF_COOLIFY_SERVER
TTL: Auto (أو 3600)
```

أو CNAME Record:
```
Type: CNAME
Name: student-plan
Value: your-coolify-domain.com
TTL: Auto
```

### الخطوة 3: SSL Certificate

Coolify يوفر SSL تلقائياً باستخدام Let's Encrypt:

1. في إعدادات Domain، فعّل **Auto SSL**
2. انتظر بضع دقائق حتى يتم إصدار الشهادة
3. ستظهر علامة خضراء عند نجاح الإصدار

---

## نشر التطبيق

### الخطوة 1: بدء النشر

1. اضغط **Deploy** في أعلى الصفحة
2. اختر **Force Deploy** إذا كنت تريد إعادة بناء كل شيء
3. انتظر حتى ينتهي البناء (قد يأخذ 2-5 دقائق)

### الخطوة 2: مراقبة البناء

1. افتح **Deployment Logs** لمتابعة العملية
2. تأكد من عدم وجود أخطاء
3. انتظر حتى ترى رسالة النجاح

### الخطوة 3: التحقق

1. افتح الـ Domain في المتصفح
2. تأكد من ظهور التطبيق بشكل صحيح
3. اختبر جميع الوظائف

---

## إعدادات متقدمة

### Auto Deploy (النشر التلقائي)

لتفعيل النشر التلقائي عند كل Push:

1. في إعدادات التطبيق
2. فعّل **Auto Deploy**
3. الآن عند كل `git push`، سيتم النشر تلقائياً

### Resource Limits

يمكنك تحديد موارد الخادم:

```yaml
CPU Limit: 1 core
Memory Limit: 512MB (أو حسب الحاجة)
```

### Health Checks

لمراقبة صحة التطبيق:

```yaml
Health Check Path: /
Health Check Interval: 30s
Health Check Timeout: 5s
Health Check Retries: 3
```

---

## Rollback (التراجع عن نشر)

إذا حدثت مشكلة بعد النشر:

1. اذهب إلى **Deployments History**
2. اختر النشر السابق الذي كان يعمل
3. اضغط **Redeploy**

---

## تحديث التطبيق

### عند تعديل الكود:

```bash
# في مجلد المشروع
git add .
git commit -m "Update: description of changes"
git push origin main
```

إذا كان Auto Deploy مفعّلاً، سيتم النشر تلقائياً.
وإلا، اضغط **Deploy** يدوياً في Coolify.

---

## استكشاف الأخطاء

### التطبيق لا يعمل بعد النشر:

1. **تحقق من Logs:**
   ```
   Coolify Dashboard > Application > Logs
   ```

2. **أخطاء شائعة:**
   - Port غير صحيح
   - Build command فشل
   - Dependencies ناقصة

### Domain لا يعمل:

1. **تحقق من DNS:**
   ```bash
   nslookup student-plan.yourdomain.com
   ```

2. **انتظر نشر DNS** (قد يأخذ حتى 48 ساعة، لكن عادة دقائق)

3. **تحقق من SSL:**
   - تأكد من أن Auto SSL مفعّل
   - حاول Force Regenerate Certificate

### Build يفشل:

1. تحقق من `package.json` و dependencies
2. تأكد من وجود `npm run build` script
3. راجع Build Logs للتفاصيل

---

## الأداء والتحسينات

### تفعيل Caching

أضف هذه الإعدادات في `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
```

### Compression

Coolify يدعم Gzip compression تلقائياً.

### CDN (اختياري)

يمكنك استخدام Cloudflare أمام Coolify:
1. اجعل DNS يشير لـ Cloudflare
2. فعّل Proxy (السحابة البرتقالية)
3. فعّل Caching و Minification

---

## Monitoring

### مراقبة التطبيق:

1. **Uptime Monitoring:**
   - استخدم UptimeRobot أو Pingdom
   - راقب الـ endpoint كل 5 دقائق

2. **Logs:**
   - Coolify Dashboard > Logs
   - راجعها بانتظام

3. **Performance:**
   - استخدم Google PageSpeed Insights
   - راقب أوقات التحميل

---

## Backup

### النسخ الاحتياطي:

1. **الكود:** موجود في Git
2. **البيانات:** في Google Sheets (آمنة)
3. **إعدادات Coolify:** صدّرها من Dashboard

---

## ملخص الأوامر المفيدة

```bash
# بناء محلي لاختبار
npm run build
npm run preview

# اختبار Docker محلياً
docker build -t student-plan-form .
docker run -p 3000:3000 student-plan-form

# فحص التطبيق
curl https://student-plan.yourdomain.com
```

---

## الخطوات النهائية بعد النشر

1. ✅ اختبر جميع وظائف الفورم
2. ✅ تأكد من عمل Google Apps Script
3. ✅ تأكد من عمل n8n Webhook
4. ✅ اختبر توليد PDF
5. ✅ اختبر تنزيل الملف
6. ✅ راقب Logs لأي أخطاء
7. ✅ شارك الرابط مع المستخدمين

---

## مثال كامل للنشر

```bash
# 1. تحضير الكود
git clone https://github.com/your-username/student-plan-form.git
cd student-plan-form

# 2. تحديث الروابط في App.tsx
# ضع روابط Google Apps Script و n8n

# 3. رفع التغييرات
git add .
git commit -m "Update: Add production URLs"
git push origin main

# 4. في Coolify:
# - Add New Application
# - Connect Git Repository
# - Configure Build Settings
# - Add Domain
# - Deploy

# 5. بعد النشر
# - تحقق من https://student-plan.yourdomain.com
# - اختبر الفورم
# - راقب Logs
```

---

## الدعم

إذا واجهت مشاكل:

1. راجع Coolify Documentation: https://coolify.io/docs
2. تحقق من Community Forum
3. راجع Logs في Dashboard

---

تم! تطبيقك الآن منشور ومتاح للاستخدام 🎉
