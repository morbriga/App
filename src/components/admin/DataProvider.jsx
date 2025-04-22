import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Event } from '@/api/entities';
import { Post } from '@/api/entities';
import { PaymentTransaction } from '@/api/entities';

// יצירת קונטקסט לניהול הנתונים
const AdminDataContext = createContext();

export function useAdminData() {
  return useContext(AdminDataContext);
}

export default function AdminDataProvider({ children }) {
  const [userData, setUserData] = useState({ loading: true, data: [], error: null });
  const [eventData, setEventData] = useState({ loading: true, data: [], error: null });
  const [mediaData, setMediaData] = useState({ loading: true, data: [], error: null });
  const [paymentData, setPaymentData] = useState({ loading: true, data: [], error: null });
  const [dashboardStats, setDashboardStats] = useState({
    loading: true,
    stats: {
      totalUsers: 0,
      totalEvents: 0,
      totalMedia: 0,
      totalRevenue: 0,
      pendingPayments: 0
    },
    error: null
  });

  // פונקציה לטעינת נתוני משתמשים
  const loadUsers = async () => {
    try {
      setUserData({ ...userData, loading: true });
      const users = await User.list('-created_date', 100);
      setUserData({ loading: false, data: users, error: null });
      return users;
    } catch (error) {
      console.error('Error loading users:', error);
      setUserData({ loading: false, data: [], error: error.message });
      return [];
    }
  };

  // פונקציה לטעינת נתוני אירועים
  const loadEvents = async () => {
    try {
      setEventData({ ...eventData, loading: true });
      const events = await Event.list('-created_date', 100);
      setEventData({ loading: false, data: events, error: null });
      return events;
    } catch (error) {
      console.error('Error loading events:', error);
      setEventData({ loading: false, data: [], error: error.message });
      return [];
    }
  };

  // פונקציה לטעינת נתוני מדיה
  const loadMedia = async () => {
    try {
      setMediaData({ ...mediaData, loading: true });
      const posts = await Post.list('-created_date', 100);
      setMediaData({ loading: false, data: posts, error: null });
      return posts;
    } catch (error) {
      console.error('Error loading media:', error);
      setMediaData({ loading: false, data: [], error: error.message });
      return [];
    }
  };

  // פונקציה לטעינת נתוני תשלומים
  const loadPayments = async () => {
    try {
      setPaymentData({ ...paymentData, loading: true });
      const payments = await PaymentTransaction.list('-created_date', 100);
      setPaymentData({ loading: false, data: payments, error: null });
      return payments;
    } catch (error) {
      console.error('Error loading payments:', error);
      setPaymentData({ loading: false, data: [], error: error.message });
      return [];
    }
  };

  // פונקציה לחישוב סטטיסטיקות לדשבורד
  const calculateDashboardStats = async () => {
    try {
      setDashboardStats({ ...dashboardStats, loading: true });
      
      // טעינת נתונים מכל המקורות במקביל
      const [users, events, media, payments] = await Promise.all([
        loadUsers(),
        loadEvents(),
        loadMedia(),
        loadPayments()
      ]);
      
      // חישוב סטטיסטיקות
      const totalUsers = users.length;
      const totalEvents = events.length;
      const totalMedia = media.length;
      
      // חישוב הכנסות
      const approvedPayments = payments.filter(p => p.status === 'approved');
      const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // תשלומים בהמתנה
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      
      setDashboardStats({
        loading: false,
        stats: {
          totalUsers,
          totalEvents,
          totalMedia,
          totalRevenue,
          pendingPayments
        },
        error: null
      });
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      setDashboardStats({
        loading: false,
        stats: {
          totalUsers: 0,
          totalEvents: 0,
          totalMedia: 0,
          totalRevenue: 0,
          pendingPayments: 0
        },
        error: error.message
      });
    }
  };

  // פונקציה לרענון כל הנתונים
  const refreshAllData = async () => {
    await calculateDashboardStats();
  };

  // טעינת נתונים בטעינה הראשונית
  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        const currentUser = await User.me();
        
        if (currentUser?.is_admin) {
          await refreshAllData();
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };
    
    checkAdminAndLoadData();
  }, []);

  // הערך שיסופק על ידי הקונטקסט
  const value = {
    users: userData,
    events: eventData,
    media: mediaData,
    payments: paymentData,
    stats: dashboardStats,
    refreshData: refreshAllData,
    loadUsers,
    loadEvents,
    loadMedia,
    loadPayments
  };

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
}