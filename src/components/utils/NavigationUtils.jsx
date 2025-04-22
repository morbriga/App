// ספריית עזר לניווט ובדיקת מצב ההתחברות

import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

/**
 * בדיקה אם המשתמש מחובר
 * @returns {Promise<Object|null>} אובייקט המשתמש או null אם לא מחובר
 */
export async function checkUserLogin() {
  try {
    return await User.me();
  } catch (error) {
    return null;
  }
}

/**
 * פונקציה לניווט בהתאם למצב ההתחברות של המשתמש
 * @param {string} authenticatedPath הנתיב אם המשתמש מחובר
 * @param {string} unauthenticatedPath הנתיב אם המשתמש לא מחובר
 * @returns {Promise<void>}
 */
export async function navigateBasedOnAuth(authenticatedPath, unauthenticatedPath) {
  try {
    const user = await checkUserLogin();
    if (user) {
      window.location.href = createPageUrl(authenticatedPath);
    } else {
      window.location.href = createPageUrl(unauthenticatedPath);
    }
  } catch (error) {
    console.error('Error navigating based on auth:', error);
    window.location.href = createPageUrl(unauthenticatedPath);
  }
}

/**
 * פונקציה להתחברות והפניה לדף מסוים
 * @param {string} redirectPath הנתיב לאחר התחברות מוצלחת
 * @returns {Promise<void>}
 */
export async function loginAndRedirect(redirectPath) {
  try {
    await User.login();
    window.location.href = createPageUrl(redirectPath);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}