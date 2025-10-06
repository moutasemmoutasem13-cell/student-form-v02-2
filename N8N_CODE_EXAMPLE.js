// ===============================================
// أمثلة على أكواد n8n Nodes
// ===============================================
//
// استخدم هذه الأمثلة في n8n Code nodes
//
// ===============================================

// ===============================================
// 1. Function Node: معالجة البيانات الواردة
// ===============================================

// يوضع هذا الكود في Function node بعد Webhook مباشرة
const incomingData = $input.item.json.body || $input.item.json;

// استخراج وتنسيق البيانات
const formattedData = {
  studentName: incomingData.studentName,
  group: incomingData.group,
  planType: incomingData.planType,
  planElement: incomingData.planElement,
  day1: incomingData.attendanceDays[0],
  day2: incomingData.attendanceDays[1],
  startDate: incomingData.startDate,
  planDuration: incomingData.planDuration,
  generatedAt: new Date().toLocaleString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),
  fileName: `plan_${incomingData.studentName}_${Date.now()}.pdf`
};

return {
  json: formattedData
};

// ===============================================
// 2. Code Node: توليد HTML للـ PDF
// ===============================================

// يستخدم لتوليد HTML من البيانات
const data = $input.item.json;

const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Tahoma', sans-serif;
      direction: rtl;
      text-align: right;
      padding: 40px;
      color: #333;
      font-size: 14px;
      line-height: 1.8;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border: 2px solid #2563eb;
      border-radius: 8px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }

    .header h1 {
      color: #1e40af;
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .section-title {
      background: #eff6ff;
      padding: 12px 20px;
      color: #1e40af;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0 15px 0;
      border-right: 4px solid #2563eb;
    }

    .info-row {
      padding: 15px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      margin-bottom: 10px;
    }

    .label {
      font-weight: bold;
      color: #475569;
      margin-left: 10px;
    }

    .value {
      color: #1e293b;
      font-weight: 500;
    }

    .day-badge {
      background: #2563eb;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      margin-left: 10px;
      display: inline-block;
    }

    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 خطة الطالب التعليمية</h1>
    </div>

    <div class="section-title">معلومات الطالب</div>
    <div class="info-row">
      <span class="label">اسم الطالب:</span>
      <span class="value">${data.studentName}</span>
    </div>
    <div class="info-row">
      <span class="label">المجموعة:</span>
      <span class="value">${data.group}</span>
    </div>

    <div class="section-title">تفاصيل الخطة</div>
    <div class="info-row">
      <span class="label">نوع الخطة:</span>
      <span class="value">${data.planType}</span>
    </div>
    <div class="info-row">
      <span class="label">عنصر الخطة:</span>
      <span class="value">${data.planElement}</span>
    </div>

    <div class="section-title">جدول الحضور</div>
    <div class="info-row">
      <span class="label">أيام الدوام:</span>
      <span class="day-badge">${data.day1}</span>
      <span class="day-badge">${data.day2}</span>
    </div>

    <div class="section-title">الجدول الزمني</div>
    <div class="info-row">
      <span class="label">تاريخ البداية:</span>
      <span class="value">${data.startDate}</span>
    </div>
    <div class="info-row">
      <span class="label">مدة الخطة:</span>
      <span class="value">${data.planDuration} يوم</span>
    </div>

    <div class="footer">
      <p>تاريخ الإنشاء: ${data.generatedAt}</p>
      <p>هذا المستند تم إنشاؤه تلقائياً</p>
    </div>
  </div>
</body>
</html>
`;

return {
  json: {
    html: htmlContent,
    fileName: data.fileName
  }
};

// ===============================================
// 3. Code Node: توليد PDF باستخدام Puppeteer
// ===============================================

// استخدم هذا إذا كان n8n مستضاف ذاتياً وPuppeteer مثبت
// تأكد من تفعيل "Mode: Run Once for All Items"

const puppeteer = require('puppeteer');

// الحصول على HTML من Node السابق
const htmlContent = $input.item.json.html;
const fileName = $input.item.json.fileName;

try {
  // إطلاق المتصفح
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  });

  // فتح صفحة جديدة
  const page = await browser.newPage();

  // تعيين المحتوى
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0'
  });

  // توليد PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });

  // إغلاق المتصفح
  await browser.close();

  // إرجاع البيانات
  return {
    binary: {
      data: pdfBuffer,
      mimeType: 'application/pdf',
      fileName: fileName
    }
  };

} catch (error) {
  throw new Error('فشل في توليد PDF: ' + error.message);
}

// ===============================================
// 4. Function Node: إنشاء استجابة نهائية
// ===============================================

// يستخدم بعد رفع الملف على Storage
const uploadResult = $input.item.json;

// استخراج رابط الملف حسب نوع Storage المستخدم
let fileUrl = '';

// لـ Google Drive
if (uploadResult.webViewLink) {
  fileUrl = uploadResult.webViewLink;
}
// لـ Dropbox
else if (uploadResult.url) {
  fileUrl = uploadResult.url;
}
// لـ AWS S3
else if (uploadResult.Location) {
  fileUrl = uploadResult.Location;
}
// مخصص
else if (uploadResult.link) {
  fileUrl = uploadResult.link;
}

// إنشاء استجابة للواجهة
return {
  json: {
    success: true,
    pdfUrl: fileUrl,
    message: 'تم إنشاء الملف بنجاح',
    fileName: uploadResult.name || uploadResult.fileName || 'plan.pdf',
    timestamp: new Date().toISOString()
  }
};

// ===============================================
// 5. Error Handler Function
// ===============================================

// يستخدم في Error Trigger node
const error = $input.item.error;

return {
  json: {
    success: false,
    error: true,
    message: 'حدث خطأ في معالجة الطلب',
    details: error?.message || 'خطأ غير معروف',
    timestamp: new Date().toISOString()
  }
};

// ===============================================
// 6. HTTP Request Node: استخدام خدمة PDF خارجية
// ===============================================

/*
استخدم HTTP Request node مع هذه الإعدادات:

Method: POST
URL: https://api.html2pdf.app/v1/generate
Headers:
  - Content-Type: application/json
  - Authorization: Bearer YOUR_API_KEY

Body (JSON):
{
  "html": "{{ $json.html }}",
  "options": {
    "format": "A4",
    "printBackground": true,
    "margin": {
      "top": "20mm",
      "right": "20mm",
      "bottom": "20mm",
      "left": "20mm"
    }
  }
}
*/

// ===============================================
// 7. Google Drive Upload Configuration
// ===============================================

/*
استخدم Google Drive node مع:

Operation: Upload
File Name: {{ $json.fileName }}
Binary Property: data
Parents: [folder_id_here]

Options:
  - Convert to Google Docs: No
  - Share: Anyone with the link
  - Role: Reader
*/

// ===============================================
// 8. مثال على Workflow كامل (Pseudo-code)
// ===============================================

/*
Workflow Structure:

1. Webhook (POST)
   ↓
2. Function: Format Data
   Input: webhook body
   Output: formatted data
   ↓
3. Code: Generate HTML
   Input: formatted data
   Output: html content
   ↓
4. Code: Generate PDF (Puppeteer)
   Input: html content
   Output: pdf buffer
   ↓
5. Google Drive: Upload
   Input: pdf buffer
   Output: file link
   ↓
6. Function: Create Response
   Input: file link
   Output: api response
   ↓
7. Respond to Webhook
   Input: api response

Error Path:
8. Error Trigger
   ↓
9. Function: Error Response
   ↓
10. Respond to Webhook (error)
*/

// ===============================================
// نصائح مهمة
// ===============================================

/*
1. استخدم Try-Catch في Code nodes للتعامل مع الأخطاء
2. أضف logging لتسهيل التتبع
3. اختبر كل Node على حدة قبل ربطها
4. استخدم Static Data أثناء التطوير
5. فعّل Retry في حالة فشل الطلبات
6. أضف Timeout مناسب للعمليات الطويلة
7. راقب Execution logs بانتظام
8. استخدم Webhook Test في Postman أولاً
*/

// ===============================================
// مثال اختبار Webhook بـ curl
// ===============================================

/*
curl -X POST https://your-n8n.com/webhook/student-plan \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "أحمد محمد",
    "group": "المجموعة أ",
    "planType": "خطة القراءة",
    "planElement": "كتاب الحروف",
    "attendanceDays": ["السبت", "الاثنين"],
    "startDate": "1/10/2025",
    "planDuration": "30"
  }'
*/
