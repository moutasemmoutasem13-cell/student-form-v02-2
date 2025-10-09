import { useState, useEffect } from 'react';
import { Save, Link, Loader2, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { supabase, Center } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [googleScriptUrl, setGoogleScriptUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [centers, setCenters] = useState<Center[]>([]);
  const [newCenterName, setNewCenterName] = useState('');
  const [addingCenter, setAddingCenter] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchCenters();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
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
      setError('حدث خطأ في تحميل الإعدادات');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!googleScriptUrl.trim() || !webhookUrl.trim()) {
      setError('الرجاء إدخال جميع الروابط المطلوبة');
      return;
    }

    try {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(googleScriptUrl) || !urlPattern.test(webhookUrl)) {
        setError('الرجاء إدخال روابط صحيحة تبدأ بـ http:// أو https://');
        return;
      }
    } catch (err) {
      setError('الرجاء إدخال روابط صحيحة');
      return;
    }

    setSaving(true);

    try {
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existingSettings) {
        const { error } = await supabase
          .from('settings')
          .update({
            google_apps_script_url: googleScriptUrl,
            n8n_webhook_url: webhookUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('settings')
          .insert({
            user_id: user?.id,
            google_apps_script_url: googleScriptUrl,
            n8n_webhook_url: webhookUrl
          });

        if (error) throw error;
      }

      setSuccess('تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('حدث خطأ في حفظ الإعدادات');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCenter = async () => {
    if (!newCenterName.trim()) {
      setError('الرجاء إدخال اسم المركز');
      return;
    }

    setAddingCenter(true);
    setError('');

    try {
      const { error } = await supabase
        .from('centers')
        .insert({ name: newCenterName.trim() });

      if (error) throw error;

      setNewCenterName('');
      setSuccess('تم إضافة المركز بنجاح');
      setTimeout(() => setSuccess(''), 3000);
      await fetchCenters();
    } catch (err) {
      setError('حدث خطأ في إضافة المركز');
      console.error('Error adding center:', err);
    } finally {
      setAddingCenter(false);
    }
  };

  const handleDeleteCenter = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المركز؟')) return;

    try {
      const { error } = await supabase
        .from('centers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('تم حذف المركز بنجاح');
      setTimeout(() => setSuccess(''), 3000);
      await fetchCenters();
    } catch (err) {
      setError('حدث خطأ في حذف المركز');
      console.error('Error deleting center:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">الإعدادات</h1>
          <p className="text-gray-600">إدارة روابط الاتصال والمراكز</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <div className="space-y-8">
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Link className="w-5 h-5" />
              روابط الاتصال
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط Google Apps Script *
                </label>
                <input
                  type="url"
                  value={googleScriptUrl}
                  onChange={(e) => setGoogleScriptUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="https://script.google.com/macros/s/..."
                  dir="ltr"
                />
                <p className="mt-2 text-sm text-gray-500">
                  الرابط المستخدم لجلب البيانات من Google Sheets
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط n8n Webhook *
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="https://n8n.example.com/webhook/..."
                  dir="ltr"
                />
                <p className="mt-2 text-sm text-gray-500">
                  الرابط المستخدم لإرسال البيانات وتوليد ملف PDF
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ الإعدادات
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">إدارة المراكز</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إضافة مركز جديد
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCenterName}
                  onChange={(e) => setNewCenterName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="اسم المركز"
                  dir="rtl"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCenter()}
                />
                <button
                  onClick={handleAddCenter}
                  disabled={addingCenter}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {addingCenter ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  إضافة
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {centers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد مراكز حالياً</p>
              ) : (
                centers.map((center) => (
                  <div
                    key={center.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <span className="text-gray-800 font-medium">{center.name}</span>
                    <button
                      onClick={() => handleDeleteCenter(center.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                      title="حذف المركز"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
