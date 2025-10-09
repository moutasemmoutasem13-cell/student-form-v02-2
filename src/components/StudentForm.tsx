import { useState, useEffect } from 'react';
import { FileDown, Loader2, AlertCircle } from 'lucide-react';
import { supabase, Center } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  studentName: string;
  group: string;
  center: string;
  planType: string;
  planElement: string;
  day1: string;
  day2: string;
  day3: string;
  startDay: string;
  startMonth: string;
  startYear: string;
  planDuration: string;
}

interface DropdownData {
  groups: string[];
  planTypes: { [key: string]: string[] };
  days: string[];
}

export default function StudentForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    group: '',
    center: '',
    planType: '',
    planElement: '',
    day1: '',
    day2: '',
    day3: '',
    startDay: '',
    startMonth: '',
    startYear: '',
    planDuration: ''
  });

  const [dropdownData, setDropdownData] = useState<DropdownData>({
    groups: [],
    planTypes: {},
    days: []
  });

  const [centers, setCenters] = useState<Center[]>([]);
  const [planElements, setPlanElements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleScriptUrl, setGoogleScriptUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchCenters();
  }, []);

  useEffect(() => {
    if (googleScriptUrl) {
      fetchDropdownData();
    }
  }, [googleScriptUrl]);

  useEffect(() => {
    if (formData.planType && dropdownData.planTypes[formData.planType]) {
      setPlanElements(dropdownData.planTypes[formData.planType]);
      setFormData(prev => ({ ...prev, planElement: '' }));
    } else {
      setPlanElements([]);
    }
  }, [formData.planType, dropdownData.planTypes]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGoogleScriptUrl(data.google_apps_script_url || '');
        setWebhookUrl(data.n8n_webhook_url || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCenters(data || []);
    } catch (err) {
      console.error('Error fetching centers:', err);
    }
  };

  const fetchDropdownData = async () => {
    try {
      setDataLoading(true);
      const response = await fetch(googleScriptUrl);
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      const data = await response.json();
      setDropdownData(data);
      setError('');
    } catch (err) {
      setError('حدث خطأ في جلب البيانات. تأكد من إضافة رابط Google Apps Script في الإعدادات.');
      console.error('Error fetching data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.studentName.trim()) {
      setError('الرجاء إدخال اسم الطالب');
      return false;
    }
    if (!formData.center) {
      setError('الرجاء اختيار المركز');
      return false;
    }
    if (!formData.group) {
      setError('الرجاء اختيار المجموعة');
      return false;
    }
    if (!formData.planType) {
      setError('الرجاء اختيار نوع الخطة');
      return false;
    }
    if (!formData.planElement) {
      setError('الرجاء اختيار عنصر الخطة');
      return false;
    }
    if (!formData.day1 || !formData.day2 || !formData.day3) {
      setError('الرجاء اختيار أيام الدوام الثلاثة');
      return false;
    }
    const days = [formData.day1, formData.day2, formData.day3];
    const uniqueDays = new Set(days);
    if (uniqueDays.size !== days.length) {
      setError('الرجاء اختيار ثلاثة أيام مختلفة');
      return false;
    }
    if (!formData.startDay || !formData.startMonth || !formData.startYear) {
      setError('الرجاء إدخال تاريخ البداية كاملاً');
      return false;
    }
    const day = parseInt(formData.startDay);
    const month = parseInt(formData.startMonth);
    const year = parseInt(formData.startYear);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2100) {
      setError('الرجاء إدخال تاريخ صحيح');
      return false;
    }
    if (!formData.planDuration || parseInt(formData.planDuration) <= 0) {
      setError('الرجاء إدخال مدة الخطة');
      return false;
    }
    if (!webhookUrl) {
      setError('الرجاء إضافة رابط Webhook في الإعدادات');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setPdfUrl('');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          center: formData.center,
          group: formData.group,
          planType: formData.planType,
          planElement: formData.planElement,
          attendanceDays: [formData.day1, formData.day2, formData.day3],
          startDate: `${formData.startDay}/${formData.startMonth}/${formData.startYear}`,
          planDuration: formData.planDuration
        })
      });

      if (!response.ok) throw new Error('فشل في إرسال البيانات');

      const result = await response.json();

      if (result.pdfUrl) {
        setPdfUrl(result.pdfUrl);
        setError('');
      } else {
        throw new Error('لم يتم استلام رابط الملف');
      }
    } catch (err) {
      setError('حدث خطأ في إرسال البيانات. الرجاء المحاولة مرة أخرى.');
      console.error('Error submitting form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (dataLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">نموذج خطة الطالب</h1>
          <p className="text-gray-600">املأ النموذج للحصول على ملف PDF</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الطالب *
            </label>
            <input
              type="text"
              value={formData.studentName}
              onChange={(e) => handleInputChange('studentName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="أدخل اسم الطالب"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المركز *
            </label>
            <select
              value={formData.center}
              onChange={(e) => handleInputChange('center', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              dir="rtl"
            >
              <option value="">اختر المركز</option>
              {centers.map((center) => (
                <option key={center.id} value={center.name}>{center.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المجموعة *
            </label>
            <select
              value={formData.group}
              onChange={(e) => handleInputChange('group', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              dir="rtl"
            >
              <option value="">اختر المجموعة</option>
              {dropdownData.groups.map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الخطة *
            </label>
            <select
              value={formData.planType}
              onChange={(e) => handleInputChange('planType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              dir="rtl"
            >
              <option value="">اختر نوع الخطة</option>
              {Object.keys(dropdownData.planTypes).map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {planElements.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنصر الخطة *
              </label>
              <select
                value={formData.planElement}
                onChange={(e) => handleInputChange('planElement', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                dir="rtl"
              >
                <option value="">اختر عنصر الخطة</option>
                {planElements.map((element) => (
                  <option key={element} value={element}>{element}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اليوم الأول *
              </label>
              <select
                value={formData.day1}
                onChange={(e) => handleInputChange('day1', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                dir="rtl"
              >
                <option value="">اختر اليوم</option>
                {dropdownData.days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اليوم الثاني *
              </label>
              <select
                value={formData.day2}
                onChange={(e) => handleInputChange('day2', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                dir="rtl"
              >
                <option value="">اختر اليوم</option>
                {dropdownData.days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اليوم الثالث *
              </label>
              <select
                value={formData.day3}
                onChange={(e) => handleInputChange('day3', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                dir="rtl"
              >
                <option value="">اختر اليوم</option>
                {dropdownData.days.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاريخ البداية *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                value={formData.startDay}
                onChange={(e) => handleInputChange('startDay', e.target.value)}
                placeholder="اليوم"
                min="1"
                max="31"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center"
              />
              <input
                type="number"
                value={formData.startMonth}
                onChange={(e) => handleInputChange('startMonth', e.target.value)}
                placeholder="الشهر"
                min="1"
                max="12"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center"
              />
              <input
                type="number"
                value={formData.startYear}
                onChange={(e) => handleInputChange('startYear', e.target.value)}
                placeholder="السنة"
                min="2000"
                max="2100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مدة الخطة (بالأيام) *
            </label>
            <input
              type="number"
              value={formData.planDuration}
              onChange={(e) => handleInputChange('planDuration', e.target.value)}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="أدخل عدد الأيام"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال النموذج'
              )}
            </button>

            {pdfUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <FileDown className="w-5 h-5" />
                تحميل الملف
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
