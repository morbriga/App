import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from 'lucide-react';
import Logo from '../components/Logo';

export default function AdminLoginRedirect() {
  // מיד בטעינת הדף עובר לאפליקציית ניהול נפרדת
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://admin.beventx.com";
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleManualRedirect = () => {
    window.location.href = "https://admin.beventx.com";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50 p-4">
      <Card className="w-full max-w-md border-none shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto mb-2">
            <Logo className="w-12 h-12" />
          </div>
          <CardTitle className="text-2xl">ממשק ניהול</CardTitle>
          <CardDescription>
            מעביר אותך לממשק הניהול של BeventX...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          
          <p className="text-gray-600">
            אם אינך מועבר באופן אוטומטי, אנא לחץ על הכפתור למטה
          </p>
          
          <Button 
            onClick={handleManualRedirect}
            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            עבור לממשק הניהול
            <ExternalLink className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}