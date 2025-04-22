import React, { useState } from 'react';
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { User } from '@/api/entities';
import Logo from '../components/Logo';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await User.login();

      // בדיקה אם המשתמש שהתחבר הוא מנהל
      const user = await User.me();
      if (user?.is_admin) {
        window.location.href = createPageUrl('AdminDashboard');
      } else {
        setError('משתמש זה אינו מורשה לגשת למערכת הניהול');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('אירעה שגיאה בהתחברות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-none shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2">
              <Logo className="w-12 h-12" />
            </div>
            <CardTitle className="text-2xl">כניסת מנהלים</CardTitle>
            <CardDescription>
              התחבר כדי לגשת למערכת הניהול
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'התחבר עם Google'
              )}
            </Button>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              גישה למנהלים מורשים בלבד
            </p>

            <Button 
              variant="ghost" 
              onClick={() => window.location.href = createPageUrl('Home')}
              className="w-full mt-4 text-gray-600"
            >
              חזרה לדף הבית
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}