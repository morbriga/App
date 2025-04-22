// מודול אינטגרציה לניהול הרשאות ואימות מנהלים
export async function authenticateAdmin({ email, password }) {
  try {
    // במערכת אמיתית, היינו שולחים בקשת POST לנקודת קצה של אימות
    // לצורך ההדגמה, נדמה תהליך אימות עם נתונים קבועים

    // בדיקה אם האימייל והסיסמה תואמים למנהל קיים
    if (email === 'admin@beventx.com' && password === 'Admin123!') {
      const adminUser = {
        id: 'admin-123',
        email: 'admin@beventx.com',
        full_name: 'מנהל המערכת',
        role: 'super_admin',
        permissions: [
          'manage_users',
          'manage_events',
          'manage_payments',
          'manage_content',
          'manage_settings',
          'view_analytics'
        ],
        last_login: new Date().toISOString(),
        status: 'active'
      };
      
      // שמירת מידע על המנהל בלוקל סטורג'
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      localStorage.setItem('admin_token', 'admin-token-123'); // במערכת אמיתית, זה יהיה JWT
      
      return adminUser;
    } else if (email === 'support@beventx.com' && password === 'Support123!') {
      const supportUser = {
        id: 'support-123',
        email: 'support@beventx.com',
        full_name: 'תמיכה טכנית',
        role: 'support',
        permissions: [
          'view_users',
          'view_events',
          'view_payments',
          'manage_content'
        ],
        last_login: new Date().toISOString(),
        status: 'active'
      };
      
      // שמירת מידע על המנהל בלוקל סטורג'
      localStorage.setItem('admin_user', JSON.stringify(supportUser));
      localStorage.setItem('admin_token', 'support-token-123');
      
      return supportUser;
    }
    
    // אם לא נמצאה התאמה
    throw new Error('אימייל או סיסמה שגויים');
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

export async function getCurrentAdmin() {
  try {
    const adminToken = localStorage.getItem('admin_token');
    const adminJson = localStorage.getItem('admin_user');
    
    if (!adminToken || !adminJson) {
      throw new Error('לא מחובר');
    }
    
    return JSON.parse(adminJson);
  } catch (error) {
    console.error('Error getting current admin:', error);
    throw error;
  }
}

export async function logoutAdmin() {
  try {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return { success: true };
  } catch (error) {
    console.error('Error logging out admin:', error);
    throw error;
  }
}

export async function hasPermission(permission) {
  try {
    const admin = await getCurrentAdmin();
    
    // בדיקה אם למנהל יש את ההרשאה הספציפית
    if (admin.role === 'super_admin') {
      return true; // למנהל ראשי יש את כל ההרשאות
    }
    
    return admin.permissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}