
import React, { useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Users, CreditCard, Image as ImageIcon, Calendar, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminData } from '../components/admin/DataProvider';
import AdminDataProvider from '../components/admin/DataProvider';

export default function AdminDashboard() {
  return (
    <AdminDataProvider>
      <AdminDashboardContent />
    </AdminDataProvider>
  );
}

function AdminDashboardContent() {
  const { stats, refreshData } = useAdminData();
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = await User.me();
        if (!currentUser) {
          // אם המשתמש לא מחובר בכלל, מפנים אותו לדף התחברות
          window.location.href = createPageUrl('Welcome');
          return;
        }
        
        if (!currentUser?.is_admin) {
          // אם המשתמש מחובר אבל לא מנהל, מפנים אותו לדף הבית
          window.location.href = createPageUrl('Home');
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = createPageUrl('Welcome');
      }
    };

    checkAdminAccess();
  }, []);

  const handleRefreshData = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  if (stats.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">לוח בקרה</h1>
            <p className="text-gray-600">ברוך הבא למערכת הניהול</p>
          </div>
          
          <Button 
            onClick={handleRefreshData} 
            variant="outline" 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            רענן נתונים
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="משתמשים"
            value={stats.stats.totalUsers}
            icon={<Users className="h-6 w-6 text-indigo-600" />}
          />
          <StatCard
            title="אירועים"
            value={stats.stats.totalEvents}
            icon={<Calendar className="h-6 w-6 text-pink-600" />}
          />
          <StatCard
            title="קבצי מדיה"
            value={stats.stats.totalMedia}
            icon={<ImageIcon className="h-6 w-6 text-amber-600" />}
          />
          <StatCard
            title="הכנסות"
            value={`₪${stats.stats.totalRevenue.toLocaleString()}`}
            icon={<CreditCard className="h-6 w-6 text-green-600" />}
          />
        </div>
        
        {stats.stats.pendingPayments > 0 && (
          <Card className="mb-8 bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-800">
                    {stats.stats.pendingPayments} תשלומים ממתינים לאישור
                  </p>
                  <p className="text-sm text-amber-700">
                    יש לבדוק ולאשר את התשלומים בהקדם
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {stats.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-8">
            <p className="font-medium">שגיאה בטעינת נתונים:</p>
            <p>{stats.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-none shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-full">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
