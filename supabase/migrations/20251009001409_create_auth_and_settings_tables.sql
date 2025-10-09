/*
  # إنشاء جداول النظام

  ## 1. الجداول الجديدة
    
    ### `centers` - جدول المراكز
      - `id` (uuid, primary key)
      - `name` (text) - اسم المركز
      - `created_at` (timestamptz) - وقت الإنشاء
      - `updated_at` (timestamptz) - وقت آخر تحديث
    
    ### `settings` - جدول الإعدادات
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - معرف المستخدم
      - `google_apps_script_url` (text) - رابط Google Apps Script
      - `n8n_webhook_url` (text) - رابط n8n Webhook
      - `created_at` (timestamptz) - وقت الإنشاء
      - `updated_at` (timestamptz) - وقت آخر تحديث

  ## 2. الأمان (RLS)
    - تفعيل RLS على جميع الجداول
    - المستخدمون المصرح لهم يمكنهم قراءة المراكز
    - كل مستخدم يمكنه قراءة وتعديل إعداداته الخاصة فقط
*/

-- إنشاء جدول المراكز
CREATE TABLE IF NOT EXISTS centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_apps_script_url text DEFAULT '',
  n8n_webhook_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- تفعيل RLS على جدول المراكز
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المراكز
CREATE POLICY "Authenticated users can view centers"
  ON centers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert centers"
  ON centers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update centers"
  ON centers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete centers"
  ON centers FOR DELETE
  TO authenticated
  USING (true);

-- تفعيل RLS على جدول الإعدادات
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- سياسات جدول الإعدادات
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- إضافة بعض المراكز الافتراضية
INSERT INTO centers (name) VALUES 
  ('المركز الرئيسي'),
  ('فرع الشمال'),
  ('فرع الجنوب'),
  ('فرع الشرق'),
  ('فرع الغرب')
ON CONFLICT DO NOTHING;