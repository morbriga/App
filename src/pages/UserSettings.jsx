import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { User } from '@/api/entities';
import { Event } from '@/api/entities';
import { Post } from '@/api/entities';
import { FaceTag } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, Trash2, UserX, Settings, LogOut } from 'lucide-react';

export default function UserSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        window.location.href = createPageUrl('Welcome');
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
      window.location.href = createPageUrl('Welcome');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.email) {
      alert('כתובת האימייל שהוזנה אינה תואמת');
      return;
    }

    try {
      setIsDeleting(true);

      // 1. מוצאים את כל האירועים של המשתמש
      const userEvents = await Event.filter({ owner_email: user.email });

      // 2. עבור כל אירוע, מוחקים את כל הנתונים הקשורים
      for (const event of userEvents) {
        // מחיקת תגיות פנים
        const faceTags = await FaceTag.filter({ event_id: event.id });
        for (const tag of faceTags) {
          await FaceTag.delete(tag.id);
        }

        // מחיקת פוסטים
        const posts = await Post.filter({ event_id: event.id });
        for (const post of posts) {
          await Post.delete(post.id);
        }

        // מחיקת האירוע עצמו
        await Event.delete(event.id);
      }

      // 3. מחיקת חשבון המשתמש
      await User.delete(user.id);

      // 4. התנתקות
      await User.logout();

      // 5. העברה לדף הבית
      window.location.href = createPageUrl('Home');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('אירעה שגיאה במחיקת החשבון. נסה שוב מאוחר יותר.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-gray-600" />
          <h1 className="text-3xl font-bold">הגדרות משתמש</h1>
        </div>

        <div className="space-y-6">
          {/* פרטי משתמש */}
          <Card>
            <CardHeader>
              <CardTitle>פרטי משתמש</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>שם מלא</Label>
                  <Input value={user.full_name} disabled />
                </div>
                <div>
                  <Label>אימייל</Label>
                  <Input value={user.email} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* התנתקות */}
          <Card>
            <CardHeader>
              <CardTitle>התנתקות</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={() => User.logout()}
                className="w-full sm:w-auto gap-2"
              >
                <LogOut className="w-4 h-4" />
                התנתק מהמערכת
              </Button>
            </CardContent>
          </Card>

          {/* מחיקת חשבון */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <UserX className="w-5 h-5" />
                מחיקת חשבון
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">אזהרה: פעולה זו היא בלתי הפיכה</p>
                    <p>מחיקת החשבון תגרום למחיקת:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>כל האירועים שיצרת</li>
                      <li>כל התמונות והסרטונים שהועלו</li>
                      <li>כל הנתונים המשויכים לחשבון</li>
                    </ul>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto gap-2">
                      <Trash2 className="w-4 h-4" />
                      מחק את החשבון שלי
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>האם אתה בטוח שברצונך למחוק את החשבון?</AlertDialogTitle>
                      <AlertDialogDescription>
                        פעולה זו תמחק לצמיתות את כל הנתונים שלך. לא ניתן לשחזר נתונים לאחר המחיקה.
                        <div className="mt-4">
                          <Label htmlFor="confirmEmail">הזן את האימייל שלך לאישור</Label>
                          <Input
                            id="confirmEmail"
                            type="email"
                            placeholder={user.email}
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>ביטול</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            מוחק...
                          </>
                        ) : (
                          'מחק חשבון'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}