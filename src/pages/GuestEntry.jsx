import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestUser } from '@/api/entities';
import Logo from '../components/Logo';

export default function GuestEntry() {
  const [eventCode, setEventCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [step, setStep] = useState('code'); // 'code' or 'name'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // בדיקה אם יש קוד אירוע ב-URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      setEventCode(code);
      setStep('name');
    }
  }, []);

  const validateCode = async () => {
    if (!eventCode.trim()) {
      setError('נא להזין קוד אירוע');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // בדיקה שהקוד קיים
      const { Event } = await import('@/api/entities');
      const events = await Event.filter({ code: eventCode });
      
      if (events.length === 0) {
        setError('קוד אירוע לא קיים');
        setLoading(false);
        return;
      }
      
      // קוד קיים, מעבר לשלב השם
      setStep('name');
    } catch (error) {
      console.error('Error validating code:', error);
      setError('שגיאה בבדיקת הקוד. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!guestName.trim()) {
      setError('נא להזין שם');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // קבלת האירוע
      const { Event } = await import('@/api/entities');
      const events = await Event.filter({ code: eventCode });
      
      if (events.length === 0) {
        setError('קוד אירוע לא קיים');
        setLoading(false);
        return;
      }
      
      const event = events[0];
      
      // יצירת מזהה אורח ייחודי
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // שמירה בלוקל סטורג'
      localStorage.setItem(`guestName_${eventCode}`, guestName);
      localStorage.setItem(`guestId_${eventCode}`, guestId);
      
      // שמירה במסד הנתונים
      const randomColors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
        'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-teal-500'
      ];
      const avatarColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      
      await GuestUser.create({
        event_id: event.id,
        name: guestName,
        guest_id: guestId,
        avatar_color: avatarColor
      });
      
      // מעבר לדף האירוע
      window.location.href = createPageUrl('EventFeed') + `?code=${eventCode}`;
    } catch (error) {
      console.error('Error saving guest:', error);
      setError('שגיאה בשמירת הפרטים. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <Logo className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">
            {step === 'code' ? 'הצטרפות לאירוע' : 'כמעט סיימנו!'}
          </h1>
          <p className="text-gray-600">
            {step === 'code' 
              ? 'הזן את קוד האירוע שקיבלת מהמארחים'
              : 'איך נקרא לך באירוע?'
            }
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-6">
          {step === 'code' ? (
            <>
              <div className="mb-6">
                <label htmlFor="event-code" className="block text-sm font-medium text-gray-700 mb-1">
                  קוד אירוע
                </label>
                <Input
                  id="event-code"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  placeholder="לדוגמה: ABC123"
                  className="text-center text-xl tracking-widest uppercase"
                  maxLength={10}
                />
              </div>
              
              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
              
              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
                onClick={validateCode}
                disabled={loading}
              >
                {loading ? 'בודק...' : 'המשך'}
              </Button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">
                  השם שלך
                </label>
                <Input
                  id="guest-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="השם שלך"
                  className="text-center text-xl"
                />
              </div>
              
              {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'מצטרף לאירוע...' : 'הצטרף לאירוע'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('code')}
                  disabled={loading}
                >
                  חזור
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}