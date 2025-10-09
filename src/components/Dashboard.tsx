import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, FileText, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface DashboardProps {
  children: ReactNode;
  currentPage: 'form' | 'settings';
  onNavigate: (page: 'form' | 'settings') => void;
}

export default function Dashboard({ children, currentPage, onNavigate }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-800">نظام خطة الطالب</h1>

              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => onNavigate('form')}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    currentPage === 'form'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  نموذج الخطة
                </button>
                <button
                  onClick={() => onNavigate('settings')}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    currentPage === 'settings'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  الإعدادات
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-sm text-gray-600" dir="ltr">
                {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                تسجيل خروج
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <div className="text-sm text-gray-600 pb-2 border-b border-gray-200" dir="ltr">
                {user?.email}
              </div>
              <button
                onClick={() => {
                  onNavigate('form');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentPage === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                نموذج الخطة
              </button>
              <button
                onClick={() => {
                  onNavigate('settings');
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentPage === 'settings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                الإعدادات
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut className="w-4 h-4" />
                تسجيل خروج
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
