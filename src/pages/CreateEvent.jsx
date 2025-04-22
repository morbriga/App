
import React, { useState, useEffect } from 'react';
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, 
  Camera, 
  CheckCircle2, 
  Upload, 
  QrCode, 
  Share2, 
  Edit, 
  DownloadCloud, 
  Sparkles,
  Disc
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Event } from '@/api/entities';
import { User } from '@/api/entities';
import { UserPlan } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import Logo from '../components/Logo';
import html2canvas from 'html2canvas';
import { Badge } from '@/components/ui/badge';
import QRTemplateMinimal from '../components/qr/QRTemplateMinimal';

export default function CreateEvent() {
  // Basic form data
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    type: '',
    date: '',
    description: '',
    cover_image: null,
    code: ''
  });
  
  // Wizard state
  const [step, setStep] = useState('welcome');
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasExistingEvent, setHasExistingEvent] = useState(false);
  
  // Animation variants
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };
  
  const qrRef = React.useRef(null);
  
  const downloadQR = async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true, // Important for external images
        allowTaint: true 
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      const eventTitle = createdEvent?.title || 'Event';
      link.download = `${eventTitle}-QR-Code.png`;
      link.click();
    } catch (error) {
      console.error('Error generating QR image:', error);
      alert('אירעה שגיאה בהורדת ה-QR. נסה שוב.');
    }
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await User.me();
        if (!user) {
          // אם המשתמש לא מחובר, מפנים אותו לדף ברוכים הבאים
          window.location.href = createPageUrl('Welcome');
          return;
        }
        setCurrentUser(user);
        
        // בדיקה האם למשתמש כבר יש אירוע
        if (!isEditing) {
          checkExistingEvent(user.email);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = createPageUrl('Welcome');
      }
    };

    checkAuth();
  }, []);
  
  const checkExistingEvent = async (email) => {
    if (isEditing) return; // אם אנחנו כבר בעריכה, אין צורך לבדוק
    
    try {
      const events = await Event.filter({ owner_email: email });
      if (events.length > 0 && !isEditing) {
        setHasExistingEvent(true);
        // Redirect to dashboard if we're not editing and user already has an event
        if (!window.location.search.includes('edit=')) {
          window.location.href = createPageUrl('EventsDashboard');
        }
      }
    } catch (error) {
      console.error('Error checking existing events:', error);
    }
  };
  
  const loadEvent = async (eventId) => {
    try {
      setLoading(true);
      const event = await Event.get(eventId);
      if (event) {
        setFormData({
          id: event.id,
          title: event.title || '',
          type: event.type || '',
          date: event.date || '',
          description: event.description || '',
          cover_image: event.cover_image || null,
          code: event.code || ''
        });
        
        if (event.cover_image) {
          setPreviewURL(event.cover_image);
        }
        
        setIsEditing(true);
        setStep('welcome');
      }
    } catch (error) {
      console.error('Error loading event for editing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      type: type
    }));
    setStep('basicInfo');
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const objectURL = URL.createObjectURL(file);
    setPreviewURL(objectURL);
    
    try {
      setLoading(true);
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        cover_image: file_url
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.title || !formData.type) {
      alert('אנא מלא את השדות הנדרשים');
      return;
    }
    
    setStep('processing');
    
    try {
      let event;
      if (isEditing) {
        event = await Event.update(formData.id, {
          title: formData.title,
          type: formData.type,
          date: formData.date,
          description: formData.description,
          cover_image: formData.cover_image
        });
      } else {
        const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        const eventData = {
          ...formData,
          code: randomCode,
          owner_email: currentUser?.email || 'guest@example.com'
        };
        
        event = await Event.create(eventData);
      }
      
      // Wait for a moment to show the processing animation
      setTimeout(() => {
        setCreatedEvent(event);
        setStep('success');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving event:', error);
      alert('אירעה שגיאה בשמירת האירוע. אנא נסה שנית.');
      setStep('summary');
    }
  };
  
  const getEventTypeEmoji = (type) => {
    switch(type) {
      case 'wedding': return '👰';
      case 'bar_mitzvah': return '✡️';
      case 'bat_mitzvah': return '✡️';
      case 'brit': return '👶';
      case 'corporate': return '💼';
      case 'birthday': return '🎂';
      case 'party': return '🎉';
      default: return '📅';
    }
  };

  const shareEvent = () => {
    // פונקציית שיתוף מתקדמת
    const eventUrl = `${window.location.origin}${createPageUrl('EventFeed')}?code=${createdEvent.code}`;
    const eventTitle = `הצטרפו לאירוע: ${createdEvent.title}`;
    const eventDescription = formData.description || 'הצטרפו אלינו לאירוע ושתפו תמונות';

    if (navigator.share) {
      navigator.share({
        title: eventTitle,
        text: eventDescription,
        url: eventUrl
      }).catch(err => {
        console.log('Error sharing:', err);
        navigator.clipboard.writeText(eventUrl);
        alert('הקישור הועתק ללוח');
      });
    } else {
      // גיבוי אם Web Share API לא קיים - פותח חלון נפרד
      const shareWindow = window.open('', '_blank', 'width=600,height=400');

      if (shareWindow) {
        // פתיחת חלון שיתוף מותאם אישית
        shareWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl">
          <head>
            <title>שתפו את האירוע</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                text-align: center;
                background-color: #f8f9fa;
              }
              h2 {
                margin-bottom: 20px;
              }
              .share-buttons {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
              }
              .share-button {
                padding: 10px 15px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                color: white;
                text-decoration: none;
              }
              .whatsapp { background-color: #25D366; }
              .facebook { background-color: #1877F2; }
              .twitter { background-color: #1DA1F2; }
              .telegram { background-color: #0088cc; }
              .email { background-color: #D44638; }
              .copy { 
                background-color: #6c757d;
                border: none;
                color: white;
                font-weight: bold;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <h2>שתפו את האירוע</h2>
            <div class="share-buttons">
              <a class="share-button whatsapp" href="https://wa.me/?text=${encodeURIComponent(eventTitle + ' - ' + eventUrl)}" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a7.29 7.29 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
                WhatsApp
              </a>
              <a class="share-button facebook" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
                Facebook
              </a>
              <a class="share-button twitter" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(eventTitle)}&url=${encodeURIComponent(eventUrl)}" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
                Twitter
              </a>
              <a class="share-button telegram" href="https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(eventTitle)}" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
                </svg>
                Telegram
              </a>
              <a class="share-button email" href="mailto:?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(eventDescription + ' ' + eventUrl)}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                </svg>
                Email
              </a>
            </div>
            <p style="margin-top: 20px;">או העתק את הקישור:</p>
            <input type="text" value="${eventUrl}" style="width: 100%; padding: 8px; margin: 10px 0; border-radius: 4px; border: 1px solid #ccc;" readonly>
            <button class="copy" onclick="navigator.clipboard.writeText('${eventUrl}');this.textContent='הקישור הועתק!';">העתק קישור</button>
          </body>
          </html>
        `);
      } else {
        navigator.clipboard.writeText(eventUrl);
        alert('הקישור הועתק ללוח');
      }
    }
  }
  
  const renderStep = () => {
    switch(step) {
      case 'welcome':
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center mb-8">
              <Logo className="w-12 h-12 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">היי {currentUser ? currentUser.full_name.split(' ')[0] : 'שם'} 👋</h1>
              <p className="text-gray-600">
                בוא ניצור את האלבום הדיגיטלי והפוטו-וול שלך בקלות!
              </p>
            </div>
            
            <Button 
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 rounded-xl shadow-lg shadow-pink-200 mb-4"
              onClick={() => setStep('selectType')}
              disabled={hasExistingEvent && !isEditing}
            >
              בואו נתחיל
            </Button>
            
            {isEditing && <p className="text-center text-sm text-gray-500 mt-4">מעדכנים את האירוע: {formData.title}</p>}
            {hasExistingEvent && !isEditing && (
              <p className="text-center text-sm text-red-500 mt-4">
                יש לך כבר אירוע פעיל. ניתן לערוך אותו או לשדרג את החבילה ליצירת אירועים נוספים.
              </p>
            )}
          </motion.div>
        );
        
      case 'selectType':
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h1 className="text-2xl font-bold mb-6 text-center">איזה סוג אירוע מתכננים?</h1>
            
            <div className="space-y-3">
              <EventTypeButton type="wedding" label="חתונה" emoji="👰" onClick={handleTypeSelect} />
              <EventTypeButton type="party" label="מסיבה" emoji="🎉" onClick={handleTypeSelect} />
              <EventTypeButton type="bar_mitzvah" label="בר מצווה" emoji="✡️" onClick={handleTypeSelect} />
              <EventTypeButton type="bat_mitzvah" label="בת מצווה" emoji="✡️" onClick={handleTypeSelect} />
              <EventTypeButton type="birthday" label="יום הולדת" emoji="🎂" onClick={handleTypeSelect} />
              <EventTypeButton type="corporate" label="אירוע חברה" emoji="💼" onClick={handleTypeSelect} />
              <EventTypeButton type="other" label="אחר" emoji="❓" onClick={handleTypeSelect} />
            </div>
          </motion.div>
        );
        
      case 'basicInfo':
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center mb-6">
              <span className="text-3xl mb-4 block">{getEventTypeEmoji(formData.type)}</span>
              <h1 className="text-2xl font-bold">איך נקרא לאירוע שלך?</h1>
              <p className="text-gray-600 text-sm mt-1">הוסף שם שיזכיר לך ולאורחים את האירוע</p>
            </div>
            
            <div className="space-y-6 mb-8">
              <div>
                <Input
                  placeholder="לדוגמה: החתונה של דני ורותי"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="text-lg p-6 rounded-xl border-gray-200 text-center"
                />
              </div>
              
              <div>
                <Textarea
                  placeholder="תיאור קצר של האירוע (אופציונלי)"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="rounded-xl border-gray-200 min-h-[100px]"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white py-6 px-8 rounded-xl shadow-lg shadow-pink-200"
                onClick={() => setStep('coverImage')}
                disabled={!formData.title}
              >
                המשך
              </Button>
            </div>
          </motion.div>
        );
        
      case 'coverImage':
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">תמונת כריכה</h1>
              <p className="text-gray-600 text-sm mt-1">בחר תמונה יפה שתייצג את האירוע</p>
            </div>
            
            <div className="mb-8">
              <label htmlFor="cover_image" className="cursor-pointer block">
                <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${previewURL ? 'border-pink-300 bg-pink-50/50' : 'border-gray-300 hover:border-pink-300'}`}>
                  {previewURL ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl">
                      <img 
                        src={previewURL} 
                        alt="Cover preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">לחץ כאן להעלאת תמונה</p>
                      <p className="text-xs text-gray-500 mt-1">או גרור לכאן קובץ</p>
                    </div>
                  )}
                </div>
                <input 
                  id="cover_image" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
              
              {loading && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-600">מעלה תמונה...</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                className="border-gray-200 py-6 px-8 rounded-xl"
                onClick={() => setStep('basicInfo')}
              >
                חזרה
              </Button>
              
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white py-6 px-8 rounded-xl shadow-lg shadow-pink-200"
                onClick={() => setStep('dateSelect')}
              >
                המשך
                {!previewURL && <span className="text-xs mr-2">(דלג)</span>}
              </Button>
            </div>
          </motion.div>
        );
        
      case 'dateSelect':
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">מתי האירוע מתקיים?</h1>
              <p className="text-gray-600 text-sm mt-1">בחר תאריך לאירוע שלך</p>
            </div>
            
            <div className="mb-8 flex justify-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-center border-gray-200 p-6 rounded-xl text-lg ${!formData.date && 'text-gray-500'}`}
                  >
                    <CalendarIcon className="ml-2 h-5 w-5" />
                    {formData.date ? format(new Date(formData.date), 'dd/MM/yyyy') : 'בחר תאריך'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={formData.date ? new Date(formData.date) : undefined}
                    onSelect={(date) => handleInputChange('date', date ? date.toISOString() : '')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                className="border-gray-200 py-6 px-8 rounded-xl"
                onClick={() => setStep('coverImage')}
              >
                חזרה
              </Button>
              
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white py-6 px-8 rounded-xl shadow-lg shadow-pink-200"
                onClick={() => setStep('summary')}
              >
                המשך
                {!formData.date && <span className="text-xs mr-2">(דלג)</span>}
              </Button>
            </div>
          </motion.div>
        );
        
      case 'summary':
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">מצוין! הכל מוכן</h1>
              <p className="text-gray-600 text-sm mt-1">בדוק שהכל נראה תקין לפני שנמשיך</p>
            </div>
            
            <div className="space-y-5 mb-8">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                    <span className="text-xl">{getEventTypeEmoji(formData.type)}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{formData.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formData.type === 'wedding' && 'חתונה'}
                      {formData.type === 'bar_mitzvah' && 'בר מצווה'}
                      {formData.type === 'bat_mitzvah' && 'בת מצווה'}
                      {formData.type === 'brit' && 'ברית'}
                      {formData.type === 'corporate' && 'אירוע חברה'}
                      {formData.type === 'birthday' && 'יום הולדת'}
                      {formData.type === 'party' && 'מסיבה'}
                      {formData.type === 'other' && 'אירוע אחר'}
                    </p>
                  </div>
                </div>
              </div>
              
              {formData.date && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                    <CalendarIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">תאריך האירוע</h3>
                    <p className="text-sm text-gray-500">{format(new Date(formData.date), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
              )}
              
              {previewURL && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium mb-2">תמונת כריכה</h3>
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={previewURL} 
                      alt="Cover" 
                      className="w-full h-32 object-cover" 
                    />
                  </div>
                </div>
              )}
              
              {formData.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-medium mb-1">תיאור</h3>
                  <p className="text-sm text-gray-600">{formData.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                className="border-gray-200 py-6 px-8 rounded-xl"
                onClick={() => setStep('dateSelect')}
              >
                חזרה
              </Button>
              
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white py-6 px-8 rounded-xl shadow-lg shadow-pink-200"
                onClick={handleSubmit}
                disabled={hasExistingEvent && !isEditing}
              >
                {isEditing ? 'עדכן אירוע' : 'צור אירוע'}
              </Button>
            </div>
          </motion.div>
        );
        
      case 'processing':
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-8">אנחנו על זה!</h1>
              
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 border-4 rounded-full border-pink-500 border-t-transparent animate-spin"></div>
              </div>
              
              <p className="text-gray-600">
                {isEditing ? 'מעדכנים את האירוע שלך...' : 'יוצרים את האירוע הדיגיטלי שלך...'}
              </p>
            </div>
          </motion.div>
        );
        
      case 'success':
        const eventUrl = `${window.location.origin}${createPageUrl('EventFeed')}?code=${createdEvent.code}`;
        
        return (
          <motion.div 
            className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-auto p-8"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center mb-6">
              <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold">
                {isEditing ? 'האירוע עודכן בהצלחה!' : 'האירוע נוצר בהצלחה!'}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                הנה קוד ה-QR שלך לשיתוף עם האורחים
              </p>
            </div>
            
            <div 
              ref={qrRef} 
              className="bg-white rounded-xl border mb-6 overflow-hidden"
            >
              <QRTemplateMinimal 
                event={createdEvent} 
                qrData={eventUrl} 
              />
            </div>
            
            <div className="space-y-3 mb-6">
              <Button 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-pink-200"
                onClick={shareEvent}
              >
                <Share2 className="w-4 h-4" />
                שתף את האירוע
              </Button>
              
              <Button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                onClick={downloadQR}
              >
                <DownloadCloud className="w-4 h-4" />
                הורד QR Code
              </Button>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                className="py-6 px-8 rounded-xl border-gray-200"
                onClick={() => window.location.href = createPageUrl('EventsDashboard')}
              >
                לוח הבקרה
              </Button>
              
              <Button 
                className="bg-black hover:bg-gray-800 text-white py-6 px-8 rounded-xl shadow-lg"
                onClick={() => window.location.href = createPageUrl('EventFeed') + `?code=${createdEvent.code}`}
              >
                צפה באירוע
              </Button>
            </div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-amber-50 flex items-center justify-center py-10 px-4">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

// Event Type Button Component
function EventTypeButton({ type, label, emoji, onClick }) {
  return (
    <button
      className="w-full text-right bg-white border border-gray-200 hover:border-pink-300 rounded-xl p-4 flex items-center transition-all hover:shadow-md"
      onClick={() => onClick(type)}
    >
      <span className="mr-3 text-xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
