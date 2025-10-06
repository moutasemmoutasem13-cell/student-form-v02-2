# تعليمات الإعداد الكاملة

## 1. إعداد Google Apps Script

### الخطوة 1: إنشاء Google Sheets

1. افتح Google Sheets وأنشئ ملف جديد
2. قم بإنشاء الأوراق التالية (Sheets):
   - ورقة اسمها `groups` تحتوي على عمود واحد بأسماء المجموعات
   - ورقة اسمها `planTypes` تحتوي على:
     - العمود الأول: أسماء أنواع الخطط
     - الأعمدة التالية: عناصر كل نوع خطة
   - ورقة اسمها `days` تحتوي على عمود واحد بأيام الأسبوع

#### مثال على تنسيق البيانات:

**ورقة groups:**
```
المجموعة أ
المجموعة ب
المجموعة ج
```

**ورقة planTypes:**
```
نوع الخطة    العنصر 1    العنصر 2    العنصر 3
خطة قراءة    كتاب 1      كتاب 2      كتاب 3
خطة رياضيات  جمع         طرح         ضرب
خطة علوم     فيزياء      كيمياء      أحياء
```

**ورقة days:**
```
السبت
الأحد
الاثنين
الثلاثاء
الأربعاء
الخميس
الجمعة
```

### الخطوة 2: إنشاء Apps Script

1. من القائمة، اختر: **Extensions > Apps Script**
2. احذف أي كود موجود
3. الصق الكود التالي:

```javascript
function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // جلب المجموعات
    const groupsSheet = ss.getSheetByName('groups');
    const groupsData = groupsSheet.getRange(1, 1, groupsSheet.getLastRow(), 1).getValues();
    const groups = groupsData.flat().filter(item => item !== '');

    // جلب أنواع الخطط وعناصرها
    const planTypesSheet = ss.getSheetByName('planTypes');
    const planTypesData = planTypesSheet.getDataRange().getValues();
    const planTypes = {};

    for (let i = 0; i < planTypesData.length; i++) {
      const planType = planTypesData[i][0];
      if (planType && planType !== '') {
        const elements = [];
        for (let j = 1; j < planTypesData[i].length; j++) {
          if (planTypesData[i][j] && planTypesData[i][j] !== '') {
            elements.push(planTypesData[i][j]);
          }
        }
        if (elements.length > 0) {
          planTypes[planType] = elements;
        }
      }
    }

    // جلب الأيام
    const daysSheet = ss.getSheetByName('days');
    const daysData = daysSheet.getRange(1, 1, daysSheet.getLastRow(), 1).getValues();
    const days = daysData.flat().filter(item => item !== '');

    // إرجاع البيانات بصيغة JSON
    const response = {
      groups: groups,
      planTypes: planTypes,
      days: days
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'حدث خطأ في جلب البيانات: ' + error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة اختبارية لعرض البيانات في السجل
function testGetData() {
  const result = doGet();
  Logger.log(result.getContent());
}
```

### الخطوة 3: نشر Apps Script

1. اضغط على **Deploy > New deployment**
2. اختر نوع النشر: **Web app**
3. املأ الإعدادات:
   - **Description:** Student Plan Form API
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. اضغط **Deploy**
5. انسخ **Web app URL** الذي سيظهر
6. الصق هذا الرابط في ملف `src/App.tsx` مكان `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE`

### الخطوة 4: اختبار Apps Script

1. اضغط على اسم الدالة `testGetData` من القائمة العلوية
2. اضغط **Run**
3. افتح **Execution log** لرؤية البيانات المسترجعة

---

## 2. إعداد n8n Webhook

### الخطوة 1: إنشاء Workflow في n8n

1. افتح n8n وأنشئ Workflow جديد
2. أضف **Webhook node**:
   - اختر **POST** كطريقة
   - انسخ **Webhook URL** الذي سيظهر

### الخطوة 2: معالجة البيانات وتوليد PDF

أضف العقد (Nodes) التالية حسب احتياجك:

1. **Function node** لمعالجة البيانات الواردة
2. **PDF generation node** (يمكن استخدام Puppeteer أو HTML to PDF)
3. **File storage node** (حفظ الملف في Google Drive, Dropbox, أو S3)
4. **Respond to Webhook node** لإرجاع رابط الملف

### مثال على Response من n8n:

```json
{
  "pdfUrl": "https://your-storage.com/files/student-plan.pdf"
}
```

### الخطوة 3: ربط Webhook بالتطبيق

1. انسخ **Webhook URL** من n8n
2. الصق الرابط في ملف `src/App.tsx` مكان `YOUR_N8N_WEBHOOK_URL_HERE`

---

## 3. تشغيل التطبيق محلياً

```bash
npm install
npm run dev
```

---

## 4. نشر التطبيق على Coolify

### الخطوة 1: إعداد Coolify

1. افتح Coolify Dashboard
2. أنشئ **New Resource > Application**
3. اختر **Git Repository** أو **Docker Image**

### الخطوة 2: إعدادات البناء

إذا كنت تستخدم Git:
```yaml
Build Command: npm run build
Start Command: npx serve -s dist -l 3000
Port: 3000
```

### الخطوة 3: إضافة Subdomain

1. في إعدادات التطبيق، اذهب إلى **Domains**
2. أضف Subdomain الذي تريده، مثل: `student-plan.yourdomain.com`
3. احفظ الإعدادات

### الخطوة 4: نشر التطبيق

1. اضغط **Deploy**
2. انتظر حتى ينتهي البناء
3. سيكون التطبيق متاحاً على الرابط الذي حددته

---

## 5. تحديث الروابط بعد النشر

بعد نشر Google Apps Script و n8n، قم بتحديث الروابط في `src/App.tsx`:

```typescript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/YOUR_WEBHOOK_ID';
```

---

## 6. الاختبار النهائي

1. افتح التطبيق في المتصفح
2. املأ النموذج
3. تأكد من:
   - تحميل القوائم المنسدلة بشكل صحيح
   - إرسال البيانات إلى n8n
   - استلام رابط PDF
   - تنزيل الملف بنجاح

---

## 7. استكشاف الأخطاء

### القوائم المنسدلة لا تعمل:
- تأكد من نشر Apps Script بشكل صحيح
- تحقق من أن الرابط صحيح في `App.tsx`
- افتح Console في المتصفح لرؤية الأخطاء

### إرسال النموذج لا يعمل:
- تأكد من أن Webhook في n8n مفعّل
- تحقق من أن الرابط صحيح
- افتح Network tab في Developer Tools لرؤية الطلبات

### PDF لا يتم تحميله:
- تأكد من أن n8n يرجع JSON يحتوي على `pdfUrl`
- تحقق من صلاحيات الوصول للملف المولد

---

## 8. ملاحظات مهمة

1. **الأمان:** رابط Apps Script عام، لكن البيانات للقراءة فقط
2. **CORS:** تأكد من تفعيل CORS في n8n إذا لزم الأمر
3. **الأداء:** Google Apps Script له حدود استخدام، راقب الاستخدام
4. **التخزين:** اختر مكان تخزين PDF مناسب (عمر الملف، الصلاحيات)

---

## 9. مثال على Workflow n8n الكامل

```
[Webhook]
  ↓
[Function: Process Data]
  ↓
[HTTP Request: Generate PDF via API]
  أو
[Code: Generate PDF using Puppeteer]
  ↓
[Google Drive: Upload File]
  أو
[S3: Upload File]
  ↓
[Function: Create Response]
  ↓
[Respond to Webhook]
```

---

## الدعم

إذا واجهت أي مشاكل:
1. راجع سجلات (Logs) كل خدمة
2. تأكد من صحة جميع الروابط
3. تحقق من البيانات المرسلة والمستقبلة

---

## الملفات المهمة في المشروع

- `src/App.tsx` - الملف الرئيسي للتطبيق
- `src/index.css` - ملف الأنماط
- `package.json` - إعدادات المشروع
- `vite.config.ts` - إعدادات Vite

تم إنشاء المشروع بنجاح!
