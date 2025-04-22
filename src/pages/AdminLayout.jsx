import React from 'react';
import { createPageUrl } from "@/utils";
import { 
  Users, 
  CreditCard, 
  BarChart2, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getCurrentAdmin, logoutAdmin } from '@/components/auth/AdminAuth';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [adminUser, setAdminUser] = React.useState(null);

  React.useEffect(() => {
    const checkAdminLogin = async () => {
      try {
        const admin = await getCurrentAdmin();
        setAdminUser(admin);
      } catch (error) {
        console.error("Error checking admin login:", error);
        window.location.href = createPageUrl('AdminLogin');
      } finally {
        setLoading(false);
      }
    };

    checkAdminLogin();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      window.location.href = createPageUrl('AdminLogin');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-700 border-t-transparent"></div>
      </div>
    );
  }

  const navItems = [
    { name: "לוח בקרה", href: createPageUrl('AdminDashboard'), icon: <BarChart2 className="w-5 h-5" /> },
    { name: "משתמשים", href: createPageUrl('AdminUsers'), icon: <Users className="w-5 h-5" /> },
    { name: "תשלומים", href: createPageUrl('AdminPayments'), icon: <CreditCard className="w-5 h-5" /> },
    { name: "תמונות ותוכן", href: createPageUrl('AdminContent'), icon: <ImageIcon className="w-5 h-5" /> },
    { name: "הגדרות", href: createPageUrl('AdminSettings'), icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-900">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-white">BeventX Admin</h1>
            </div>
            <div className="mt-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-sm font-medium transition-colors text-indigo-100 hover:bg-indigo-800 hover:text-white"
                >
                  {item.icon}
                  <span className="mr-3">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center text-white">
                  {adminUser?.full_name?.charAt(0) || 'A'}
                </div>
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-white">{adminUser?.full_name}</p>
                <p className="text-xs text-indigo-300">{adminUser?.role === 'super_admin' ? 'מנהל ראשי' : 'מנהל'}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-indigo-300 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-indigo-900 text-white">
        <h1 className="text-xl font-bold">BeventX Admin</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-white">BeventX Admin</h1>
              </div>
              <div className="mt-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-sm font-medium transition-colors text-indigo-100 hover:bg-indigo-800 hover:text-white"
                  >
                    {item.icon}
                    <span className="mr-3">{item.name}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-700 flex items-center justify-center text-white">
                    {adminUser?.full_name?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="mr-3">
                  <p className="text-sm font-medium text-white">{adminUser?.full_name}</p>
                  <p className="text-xs text-indigo-300">{adminUser?.role === 'super_admin' ? 'מנהל ראשי' : 'מנהל'}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-indigo-300 hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="md:pr-64">
        <main className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}