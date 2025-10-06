# 📋 نظام نموذج خطة الطالب

نظام ويب متكامل لإنشاء وإدارة خطط الطلاب مع توليد ملفات PDF تلقائياً.

## 🎯 المميزات

- ✅ واجهة عربية جميلة وسهلة الاستخدام
- ✅ جلب البيانات ديناميكياً من Google Sheets
- ✅ قوائم منسدلة متتابعة ومترابطة
- ✅ توليد ملف PDF تلقائياً عبر n8n
- ✅ تصميم متجاوب (Responsive) لجميع الأجهزة
- ✅ نظام تحقق شامل من البيانات
- ✅ رسائل خطأ واضحة باللغة العربية

## 📦 المكونات

### 1. الواجهة الأمامية (Frontend)
- React + TypeScript
- Tailwind CSS
- Vite
- Lucide React للأيقونات

### 2. مصدر البيانات
- Google Sheets (تخزين القوائم)
- Google Apps Script (API للبيانات)

### 3. معالجة البيانات
- n8n Workflow
- توليد PDF
- تخزين الملفات

## 🚀 البدء السريع

### المتطلبات
```bash
Node.js >= 18
npm أو yarn
```

### التثبيت
```bash
# نسخ المشروع
git clone <repository-url>
cd student-plan-form

# تثبيت Dependencies
npm install

# تشغيل التطبيق محلياً
npm run dev
```

## ⚙️ الإعداد

### 1️⃣ إعداد Google Sheets

انظر: [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)

- أنشئ Google Sheet جديد
- أضف الأوراق: `groups`, `planTypes`, `days`
- انسخ الكود من [GOOGLE_APPS_SCRIPT.js](./GOOGLE_APPS_SCRIPT.js)
- انشر الـ Apps Script واحصل على الرابط

### 2️⃣ إعداد n8n Workflow

انظر: [N8N_WORKFLOW_GUIDE.md](./N8N_WORKFLOW_GUIDE.md)

- أنشئ Workflow جديد
- أضف Webhook node
- أضف معالجة البيانات وتوليد PDF
- احصل على Webhook URL

### 3️⃣ تحديث الروابط

افتح `src/App.tsx` وحدث:

```typescript
const GOOGLE_APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
const N8N_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
```

### 4️⃣ النشر على Coolify

انظر: [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)

- أنشئ Application جديد
- ربط Git Repository
- إضافة Domain/Subdomain
- Deploy!

## 📁 هيكل المشروع

```
project/
├── src/
│   ├── App.tsx                 # المكون الرئيسي
│   ├── main.tsx               # نقطة البداية
│   └── index.css              # الأنماط العامة
├── public/                    # الملفات الثابتة
├── SETUP_INSTRUCTIONS.md      # دليل الإعداد الشامل
├── GOOGLE_APPS_SCRIPT.js      # كود Apps Script
├── N8N_WORKFLOW_GUIDE.md      # دليل n8n
├── COOLIFY_DEPLOYMENT.md      # دليل النشر
├── EXAMPLE_HTML_PDF_TEMPLATE.html  # قالب PDF
└── README.md                  # هذا الملف
```

## 🎨 مكونات الفورم

| المكون | النوع | الوصف |
|--------|------|-------|
| اسم الطالب | نص | حقل إدخال نصي |
| المجموعة | قائمة | من Google Sheets |
| نوع الخطة | قائمة | من Google Sheets |
| عنصر الخطة | قائمة | يعتمد على نوع الخطة |
| اليوم الأول | قائمة | من Google Sheets |
| اليوم الثاني | قائمة | من Google Sheets |
| تاريخ البداية | 3 حقول | يوم، شهر، سنة |
| مدة الخطة | رقم | عدد الأيام |

## 🔄 آلية العمل

```
1. المستخدم يفتح الصفحة
   ↓
2. تحميل البيانات من Google Apps Script
   ↓
3. ملء الفورم
   ↓
4. التحقق من البيانات
   ↓
5. إرسال إلى n8n Webhook
   ↓
6. n8n يولد ملف PDF
   ↓
7. إرجاع رابط الملف
   ↓
8. المستخدم يحمل الملف
```

## 🛠️ الأوامر المتاحة

```bash
# تشغيل محلي (Development)
npm run dev

# بناء للإنتاج (Production)
npm run build

# معاينة البناء
npm run preview

# فحص الأخطاء
npm run lint

# فحص Types
npm run typecheck
```

## 📊 البيانات المرسلة إلى n8n

```json
{
  "studentName": "أحمد محمد",
  "group": "المجموعة أ",
  "planType": "خطة القراءة",
  "planElement": "كتاب الحروف",
  "attendanceDays": ["السبت", "الاثنين"],
  "startDate": "1/10/2025",
  "planDuration": "30"
}
```

## 📥 الاستجابة المتوقعة من n8n

```json
{
  "success": true,
  "pdfUrl": "https://storage.example.com/files/plan_xxx.pdf",
  "message": "تم إنشاء الملف بنجاح",
  "timestamp": "2025-10-06T10:30:00.000Z"
}
```

## 🔒 الأمان

- رابط Google Apps Script عام لكنه للقراءة فقط
- n8n Webhook محمي (لا تشارك الرابط علناً)
- التحقق من البيانات في Frontend و Backend
- HTTPS إلزامي للإنتاج

## 🌐 المتصفحات المدعومة

- Chrome / Edge (آخر إصدارين)
- Firefox (آخر إصدارين)
- Safari (آخر إصدارين)
- Mobile browsers

## 📱 التجاوب (Responsive)

التطبيق متجاوب بالكامل ويعمل على:
- Desktop (1920px+)
- Laptop (1024px+)
- Tablet (768px+)
- Mobile (320px+)

## 🐛 استكشاف الأخطاء

### القوائم لا تظهر؟
- تحقق من رابط Google Apps Script
- افتح Console وابحث عن أخطاء

### الإرسال لا يعمل؟
- تحقق من رابط n8n Webhook
- تأكد من أن الـ Workflow مفعّل

### PDF لا يُنشأ؟
- راجع n8n Execution logs
- تأكد من صحة البيانات المرسلة

## 📚 الموارد

- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Apps Script](https://developers.google.com/apps-script)
- [n8n Documentation](https://docs.n8n.io/)
- [Coolify Documentation](https://coolify.io/docs)

## 📝 الملاحظات

1. Google Apps Script له حدود استخدام يومية
2. n8n قد يحتاج وقتاً لتوليد PDF (حسب حجم الملف)
3. روابط PDF قد تنتهي صلاحيتها (حسب إعدادات التخزين)
4. استخدم HTTPS في الإنتاج للأمان

## 🤝 المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء Branch جديد
3. Commit التغييرات
4. Push للـ Branch
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

## 📧 التواصل

للأسئلة والدعم، يرجى فتح Issue في GitHub.

---

**ملاحظة:** تأكد من قراءة جميع ملفات الدليل للحصول على تعليمات مفصلة.

تم البناء بـ ❤️ باستخدام React + TypeScript + Tailwind CSS
