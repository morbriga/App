import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from '@/api/entities';
import Logo from '../components/Logo';
import { Star, UserPlus, Zap } from 'lucide-react';

export default function Welcome() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // בדיקה אם המשתמש כבר מחובר
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (user) {
          window.location.href = createPageUrl('CreateEvent');
        }
      } catch (error) {
        // המשתמש לא מחובר - נשאר בדף הנוכחי
        console.log('User not logged in');
      }
    };

    // בדיקה אם חזרנו מהתחברות מוצלחת
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_callback')) {
      checkAuth();
    } else {
      checkAuth();
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // חשוב! צריך לציין את כל הפרמטרים האלה כדי שחלון הגוגל ייפתח
      await User.login({
        provider: 'google',
        redirectUrl: `${window.location.origin}${createPageUrl('Welcome')}?auth_callback=true`,
        scope: 'email profile',
        prompt: 'select_account'
      });

    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      alert('אירעה שגיאה בהתחברות. נסה שוב.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <Logo className="w-16 h-16" />
            </div>
            <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
              ברוכים הבאים ל-BeventX
            </CardTitle>
            <CardDescription>
              התחבר כדי ליצור ולנהל את האירועים שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="text-center px-4">
              <p className="text-gray-600 mb-8">
                BeventX מאפשרת לך ליצור אלבום דיגיטלי לאירועים שלך בקלות. 
                כל האורחים יוכלו לצלם, לשתף ולאסוף זכרונות במקום אחד.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <div className="flex items-center gap-2 bg-pink-50 px-3 py-2 rounded-full">
                  <Zap className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-pink-700">קל לשימוש</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full">
                  <Star className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-700">זכרונות נצחיים</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-700">שיתוף מיידי</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white py-6 text-lg rounded-xl"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>מתחבר...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <img 
                    src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" 
                    alt="Google logo" 
                    className="w-5 h-5"
                  />
                  <span>התחבר עם חשבון גוגל</span>
                </div>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              בהתחברות אתה מסכים לתנאי השימוש ומדיניות הפרטיות שלנו
            </p>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <a 
            href={createPageUrl('Home')} 
            className="text-sm text-gray-500 hover:text-pink-600 transition-colors"
          >
            חזרה לדף הבית
          </a>
        </div>
      </motion.div>
    </div>
  );
}