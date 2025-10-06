// ===============================================
// Google Apps Script للفورم
// ===============================================
//
// التعليمات:
// 1. افتح Google Sheets الخاص بك
// 2. اذهب إلى Extensions > Apps Script
// 3. الصق هذا الكود
// 4. احفظ المشروع
// 5. اضغط Deploy > New deployment
// 6. اختر Web app
// 7. Execute as: Me
// 8. Who has access: Anyone
// 9. Deploy وانسخ الرابط
//
// ===============================================

function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // جلب المجموعات من ورقة 'groups'
    const groupsSheet = ss.getSheetByName('groups');
    if (!groupsSheet) {
      throw new Error('ورقة "groups" غير موجودة');
    }
    const groupsData = groupsSheet.getRange(1, 1, groupsSheet.getLastRow(), 1).getValues();
    const groups = groupsData.flat().filter(item => item !== '');

    // جلب أنواع الخطط وعناصرها من ورقة 'planTypes'
    const planTypesSheet = ss.getSheetByName('planTypes');
    if (!planTypesSheet) {
      throw new Error('ورقة "planTypes" غير موجودة');
    }
    const planTypesData = planTypesSheet.getDataRange().getValues();
    const planTypes = {};

    // معالجة بيانات أنواع الخطط
    // الصف الأول يحتوي على نوع الخطة في العمود الأول
    // والأعمدة التالية تحتوي على عناصر هذه الخطة
    for (let i = 0; i < planTypesData.length; i++) {
      const planType = planTypesData[i][0];

      // تخطي الصفوف الفارغة
      if (planType && planType !== '') {
        const elements = [];

        // جلب جميع العناصر من الأعمدة التالية
        for (let j = 1; j < planTypesData[i].length; j++) {
          if (planTypesData[i][j] && planTypesData[i][j] !== '') {
            elements.push(planTypesData[i][j]);
          }
        }

        // إضافة نوع الخطة وعناصره إذا كان هناك عناصر
        if (elements.length > 0) {
          planTypes[planType] = elements;
        }
      }
    }

    // جلب أيام الأسبوع من ورقة 'days'
    const daysSheet = ss.getSheetByName('days');
    if (!daysSheet) {
      throw new Error('ورقة "days" غير موجودة');
    }
    const daysData = daysSheet.getRange(1, 1, daysSheet.getLastRow(), 1).getValues();
    const days = daysData.flat().filter(item => item !== '');

    // إنشاء استجابة JSON
    const response = {
      groups: groups,
      planTypes: planTypes,
      days: days,
      status: 'success',
      timestamp: new Date().toISOString()
    };

    // إرجاع البيانات بصيغة JSON
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // معالجة الأخطاء
    const errorResponse = {
      error: true,
      message: 'حدث خطأ في جلب البيانات: ' + error.toString(),
      status: 'error',
      timestamp: new Date().toISOString()
    };

    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===============================================
// دالة اختبارية (للتجربة في محرر Apps Script)
// ===============================================
//
// استخدم هذه الدالة لاختبار الكود قبل النشر:
// 1. اختر 'testGetData' من القائمة المنسدلة في الأعلى
// 2. اضغط Run
// 3. انظر إلى Execution log لرؤية النتائج
//
// ===============================================

function testGetData() {
  const result = doGet();
  const content = result.getContent();
  const data = JSON.parse(content);

  Logger.log('========== نتيجة الاختبار ==========');
  Logger.log('المجموعات: ' + JSON.stringify(data.groups));
  Logger.log('أنواع الخطط: ' + JSON.stringify(data.planTypes));
  Logger.log('الأيام: ' + JSON.stringify(data.days));
  Logger.log('====================================');

  return data;
}

// ===============================================
// دوال مساعدة إضافية
// ===============================================

// دالة للتحقق من وجود جميع الأوراق المطلوبة
function checkSheetStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = ['groups', 'planTypes', 'days'];
  const missingSheets = [];

  for (let sheetName of requiredSheets) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      missingSheets.push(sheetName);
    }
  }

  if (missingSheets.length > 0) {
    Logger.log('الأوراق المفقودة: ' + missingSheets.join(', '));
    return false;
  } else {
    Logger.log('جميع الأوراق المطلوبة موجودة ✓');
    return true;
  }
}

// دالة لإنشاء الأوراق المطلوبة تلقائياً مع بيانات تجريبية
function createSampleSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // إنشاء ورقة المجموعات
  let groupsSheet = ss.getSheetByName('groups');
  if (!groupsSheet) {
    groupsSheet = ss.insertSheet('groups');
    groupsSheet.getRange('A1:A5').setValues([
      ['المجموعة أ'],
      ['المجموعة ب'],
      ['المجموعة ج'],
      ['المجموعة د'],
      ['المجموعة هـ']
    ]);
  }

  // إنشاء ورقة أنواع الخطط
  let planTypesSheet = ss.getSheetByName('planTypes');
  if (!planTypesSheet) {
    planTypesSheet = ss.insertSheet('planTypes');
    planTypesSheet.getRange('A1:D3').setValues([
      ['خطة القراءة', 'كتاب الحروف', 'كتاب الكلمات', 'كتاب القصص'],
      ['خطة الرياضيات', 'الجمع', 'الطرح', 'الضرب'],
      ['خطة العلوم', 'الفيزياء', 'الكيمياء', 'الأحياء']
    ]);
  }

  // إنشاء ورقة الأيام
  let daysSheet = ss.getSheetByName('days');
  if (!daysSheet) {
    daysSheet = ss.insertSheet('days');
    daysSheet.getRange('A1:A7').setValues([
      ['السبت'],
      ['الأحد'],
      ['الاثنين'],
      ['الثلاثاء'],
      ['الأربعاء'],
      ['الخميس'],
      ['الجمعة']
    ]);
  }

  Logger.log('تم إنشاء جميع الأوراق المطلوبة مع بيانات تجريبية ✓');
}
