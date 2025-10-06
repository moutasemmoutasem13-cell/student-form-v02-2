# دليل إعداد n8n Workflow لتوليد PDF

## نظرة عامة

هذا الدليل يشرح كيفية إنشاء Workflow في n8n لاستقبال البيانات من الفورم وتوليد ملف PDF وإرجاع رابط التحميل.

---

## الخطوات الأساسية

### 1. إنشاء Workflow جديد

1. افتح n8n Dashboard
2. اضغط **New Workflow**
3. أعط الـ Workflow اسماً مناسباً مثل "Student Plan PDF Generator"

---

### 2. إضافة Webhook Node

1. اضغط **Add Node** واختر **Webhook**
2. الإعدادات:
   - **HTTP Method:** POST
   - **Path:** student-plan (أو أي اسم تريده)
   - **Response Mode:** Wait for Workflow to Complete
   - **Response Code:** 200

3. انقر **Execute Node** لتفعيل الـ Webhook
4. **انسخ Webhook URL** - ستحتاجه لاحقاً

---

### 3. إضافة Function Node لمعالجة البيانات

اضف **Function** node بعد الـ Webhook:

```javascript
// استخراج البيانات من الطلب
const data = $input.item.json.body;

// تنسيق البيانات
const formattedData = {
  studentName: data.studentName,
  group: data.group,
  planType: data.planType,
  planElement: data.planElement,
  day1: data.attendanceDays[0],
  day2: data.attendanceDays[1],
  startDate: data.startDate,
  planDuration: data.planDuration,
  generatedAt: new Date().toLocaleString('ar-SA')
};

return {
  json: formattedData
};
```

---

## خيارات توليد PDF

لديك عدة خيارات لتوليد ملف PDF:

### الخيار 1: استخدام HTML to PDF Service (الأسهل)

استخدم خدمة خارجية مثل:
- **PDFShift API**
- **HTML to PDF API**
- **DocRaptor**

#### مثال باستخدام HTTP Request Node:

```json
{
  "method": "POST",
  "url": "https://api.pdfshift.io/v3/convert/pdf",
  "authentication": "headerAuth",
  "headerAuth": {
    "name": "Authorization",
    "value": "Basic YOUR_API_KEY"
  },
  "body": {
    "source": "<html><body><h1>خطة الطالب</h1>...</body></html>",
    "landscape": false,
    "use_print": false
  }
}
```

---

### الخيار 2: استخدام Puppeteer في Code Node

إذا كان n8n مستضاف ذاتياً:

```javascript
const puppeteer = require('puppeteer');

// إنشاء HTML من البيانات
const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      direction: rtl;
      text-align: right;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .info-row {
      margin: 15px 0;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .label {
      font-weight: bold;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>خطة الطالب</h1>
  </div>

  <div class="info-row">
    <span class="label">اسم الطالب:</span>
    <span>${$input.item.json.studentName}</span>
  </div>

  <div class="info-row">
    <span class="label">المجموعة:</span>
    <span>${$input.item.json.group}</span>
  </div>

  <div class="info-row">
    <span class="label">نوع الخطة:</span>
    <span>${$input.item.json.planType}</span>
  </div>

  <div class="info-row">
    <span class="label">عنصر الخطة:</span>
    <span>${$input.item.json.planElement}</span>
  </div>

  <div class="info-row">
    <span class="label">أيام الدوام:</span>
    <span>${$input.item.json.day1} و ${$input.item.json.day2}</span>
  </div>

  <div class="info-row">
    <span class="label">تاريخ البداية:</span>
    <span>${$input.item.json.startDate}</span>
  </div>

  <div class="info-row">
    <span class="label">مدة الخطة:</span>
    <span>${$input.item.json.planDuration} يوم</span>
  </div>

  <div class="info-row">
    <span class="label">تاريخ الإنشاء:</span>
    <span>${$input.item.json.generatedAt}</span>
  </div>
</body>
</html>
`;

// توليد PDF باستخدام Puppeteer
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: {
    top: '20mm',
    right: '20mm',
    bottom: '20mm',
    left: '20mm'
  }
});

await browser.close();

// إرجاع البيانات كـ Buffer
return {
  binary: {
    data: pdfBuffer,
    mimeType: 'application/pdf',
    fileName: `plan_${Date.now()}.pdf`
  }
};
```

---

### الخيار 3: استخدام Google Docs API

1. أنشئ قالب في Google Docs
2. استخدم Google Docs API لملء القالب
3. صدّر الملف كـ PDF

---

## 4. حفظ الملف (Storage)

### الخيار أ: Google Drive

أضف **Google Drive** node:
- **Operation:** Upload
- **File Name:** `{{ $json.studentName }}_plan.pdf`
- **Parents:** اختر المجلد
- **Options > Share:** اجعله Anyone with the link

### الخيار ب: Dropbox

أضف **Dropbox** node:
- **Operation:** Upload
- **Path:** `/student-plans/{{ $json.studentName }}_plan.pdf`

### الخيار ج: AWS S3

أضف **AWS S3** node:
- **Operation:** Upload
- **Bucket:** your-bucket-name
- **File Name:** `plans/{{ $json.studentName }}_plan.pdf`
- **ACL:** public-read

---

## 5. إنشاء Response

أضف **Function** node نهائي:

```javascript
// الحصول على رابط الملف من Node السابق
const fileUrl = $input.item.json.webViewLink ||
                $input.item.json.url ||
                $input.item.json.link;

// إنشاء استجابة للفورم
return {
  json: {
    success: true,
    pdfUrl: fileUrl,
    message: 'تم إنشاء الملف بنجاح',
    timestamp: new Date().toISOString()
  }
};
```

---

## 6. إضافة Respond to Webhook Node

أضف **Respond to Webhook** node:
- **Response Body:** `{{ $json }}`
- **Response Code:** 200
- **Response Headers:**
  ```json
  {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  }
  ```

---

## 7. معالجة الأخطاء

أضف **Error Trigger** node متصل بـ Function:

```javascript
return {
  json: {
    success: false,
    error: 'حدث خطأ في إنشاء الملف',
    message: $input.item.json.message || 'خطأ غير معروف',
    timestamp: new Date().toISOString()
  }
};
```

---

## مثال Workflow كامل (مبسط)

```
[Webhook: POST /student-plan]
  ↓
[Function: Format Data]
  ↓
[Code: Generate PDF with Puppeteer]
  ↓
[Google Drive: Upload File]
  ↓
[Function: Create Response]
  ↓
[Respond to Webhook]

[Error Trigger] → [Function: Error Response] → [Respond to Webhook]
```

---

## 8. اختبار الـ Workflow

### باستخدام curl:

```bash
curl -X POST https://your-n8n.com/webhook/student-plan \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "أحمد محمد",
    "group": "المجموعة أ",
    "planType": "خطة القراءة",
    "planElement": "كتاب الحروف",
    "attendanceDays": ["السبت", "الاثنين"],
    "startDate": "1/1/2025",
    "planDuration": "30"
  }'
```

### النتيجة المتوقعة:

```json
{
  "success": true,
  "pdfUrl": "https://drive.google.com/file/d/xxx/view",
  "message": "تم إنشاء الملف بنجاح",
  "timestamp": "2025-10-06T10:30:00.000Z"
}
```

---

## 9. تفعيل وحفظ الـ Workflow

1. تأكد من حفظ الـ Workflow (Ctrl+S)
2. فعّل الـ Workflow من الزر العلوي (Toggle)
3. تأكد من أن الـ Webhook مفعّل (يجب أن يكون أخضر)

---

## 10. ربط الـ Webhook بالتطبيق

1. انسخ Webhook URL من n8n
2. افتح ملف `src/App.tsx`
3. ابحث عن السطر:
   ```typescript
   const N8N_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';
   ```
4. استبدل الرابط بـ Webhook URL الخاص بك

---

## نصائح مهمة

1. **CORS:** تأكد من إضافة Headers في Respond to Webhook
2. **التخزين:** اختر خيار تخزين يناسب احتياجاتك
3. **الأمان:** لا تشارك Webhook URL علناً إذا كان يحتوي على بيانات حساسة
4. **Monitoring:** راقب تنفيذ الـ Workflow من قسم Executions في n8n
5. **Timeout:** بعض العمليات قد تأخذ وقتاً، زد الـ timeout إذا لزم الأمر

---

## استكشاف الأخطاء

### الـ Webhook لا يستجيب:
- تأكد من أن الـ Workflow مفعّل
- تحقق من أن الـ Method هو POST
- راجع Executions log

### PDF لا يتم توليده:
- تحقق من البيانات الواردة
- راجع Error logs في الـ Code node
- تأكد من أن Puppeteer مثبت (إذا كنت تستخدمه)

### الملف لا يُحفظ:
- تحقق من صلاحيات الـ Storage service
- راجع Authentication credentials
- تأكد من أن المسار صحيح

---

## موارد إضافية

- [n8n Documentation](https://docs.n8n.io/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Google Drive API](https://developers.google.com/drive)

---

**ملاحظة:** يمكنك تخصيص قالب PDF حسب احتياجاتك بإضافة شعار، ألوان، جداول، إلخ.
