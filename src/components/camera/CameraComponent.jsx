
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadFile } from "@/api/integrations";
import { 
  X, Camera, SwitchCamera, Check, Sparkles, Layout, 
  Type, Grid, Image as ImageIcon, Smile, Timer, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuestUser } from '@/api/integrations/Supabase';

const FILTERS = [
  { id: 'normal', name: 'רגיל', filter: '' },
  { id: 'grayscale', name: 'שחור לבן', filter: 'grayscale(1)' },
  { id: 'sepia', name: 'חום', filter: 'sepia(1)' },
  { id: 'vintage', name: 'וינטג׳', filter: 'contrast(1.1) brightness(1.1) saturate(0.8) sepia(0.2)' },
  { id: 'warm', name: 'חם', filter: 'contrast(1.1) brightness(1.1) saturate(1.2) hue-rotate(10deg)' },
  { id: 'cool', name: 'קר', filter: 'contrast(1.1) brightness(1.1) saturate(1.2) hue-rotate(-10deg)' },
  { id: 'dramatic', name: 'דרמטי', filter: 'contrast(1.3) brightness(0.9) saturate(1.2)' }
];

const ASPECT_RATIOS = [
  { id: 'original', name: 'מקורי', ratio: null },
  { id: 'square', name: 'מרובע', ratio: 1 },
  { id: 'portrait', name: '4:5', ratio: 0.8 },
  { id: 'landscape', name: '16:9', ratio: 1.77 }
];

export default function CameraComponent({ onClose, onCapture, eventCode = null }) {
  // Basic camera states
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Advanced features states
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [caption, setCaption] = useState('');

  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // טיימר לצילום
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            takePhoto();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerIntervalRef.current);
    }
  }, [isTimerRunning, timerSeconds]);

  // האם יש למשתמש שם באירוע
  const [guestName, setGuestName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  useEffect(() => {
    // בדיקה אם יש שם משתמש שמור
    const savedName = localStorage.getItem(`guestName_${eventCode}`);
    if (savedName) {
      setGuestName(savedName);
    } else if (eventCode) {
      setShowNamePrompt(true);
    }
  }, [eventCode]);

  const saveGuestName = async () => {
    if (!guestName.trim()) return;
    
    localStorage.setItem(`guestName_${eventCode}`, guestName);
    
    // שמירת פרטי האורח
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(`guestId_${eventCode}`, guestId);
    
    const randomColor = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-teal-500'
    ][Math.floor(Math.random() * 8)];
    
    try {
      await GuestUser.create({
        event_id: eventCode,
        name: guestName,
        guest_id: guestId,
        avatar_color: randomColor
      });
    } catch (error) {
      console.error('Error saving guest:', error);
    }

    setShowNamePrompt(false);
  };

  useEffect(() => {
    initCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isFrontCamera]);

  const initCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          ...(hasFlash ? { flashMode: isFlashOn ? 'torch' : 'off' } : {})
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Check for flash support
        const capabilities = stream.getVideoTracks()[0].getCapabilities();
        setHasFlash(capabilities.hasOwnProperty('torch'));
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('לא ניתן לגשת למצלמה. אנא אשר גישה למצלמה ונסה שוב.');
    }
  };

  const uploadPhoto = async () => {
    if (!capturedImage) return;
    
    setIsUploading(true);
    
    try {
      // קודם כל מקבלים את הבלוב של התמונה
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // יוצרים שם קובץ עם תאריך
      const fileName = `photo_${new Date().getTime()}.jpg`;
      
      // יוצרים קובץ חדש עם השם הנכון
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      // מעלים את הקובץ
      const result = await UploadFile({ file });
      
      if (!result || !result.file_url) {
        throw new Error('לא התקבל URL לתמונה');
      }
      
      // מחזירים את התוצאה
      onCapture({
        type: 'photo',
        media_url: result.file_url,
        created_date: new Date().toISOString(),
        caption: caption
      });
      
      // סוגרים את המצלמה
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
      
      // מציגים הודעת שגיאה ספציפית יותר
      let errorMessage = 'שגיאה בהעלאת התמונה. ';
      
      if (error.message.includes('Network')) {
        errorMessage += 'בדוק את החיבור לאינטרנט ונסה שוב.';
      } else if (error.message.includes('size')) {
        errorMessage += 'התמונה גדולה מדי. נסה לצלם שוב.';
      } else {
        errorMessage += 'נסה שוב או צלם תמונה חדשה.';
      }
      
      alert(errorMessage);
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // משתמשים ברזולוציה נמוכה יותר כדי למנוע בעיות זיכרון
      const maxSize = 1920; // Full HD
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      // מקטינים את התמונה אם היא גדולה מדי
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          width = maxSize;
          height = Math.round(maxSize / aspectRatio);
        } else {
          height = maxSize;
          width = Math.round(maxSize * aspectRatio);
        }
      }

      if (selectedRatio.ratio) {
        if (selectedRatio.ratio > aspectRatio) {
          width = height * selectedRatio.ratio;
        } else {
          height = width / selectedRatio.ratio;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      
      // טיפול במצלמה קדמית - שיטה משופרת
      if (isFrontCamera) {
        // שומרים את המצב הנוכחי
        ctx.save();
        // מזיזים את נקודת ההתחלה לצד ימין
        ctx.translate(width, 0);
        // הופכים את הציר האופקי
        ctx.scale(-1, 1);
        // מציירים את התמונה
        ctx.drawImage(video, 0, 0, width, height);
        // מחזירים את המצב המקורי
        ctx.restore();
      } else {
        // מצלמה אחורית - ציור רגיל
        ctx.drawImage(video, 0, 0, width, height);
      }

      // המרה לבלוב באיכות טובה
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      
      // שחרור זיכרון
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
      
      setCapturedImage(URL.createObjectURL(blob));
    } catch (error) {
      console.error('Error capturing photo:', error);
      alert('שגיאה בצילום התמונה. נסה שוב.');
    }
  };

  const handleCapture = () => {
    if (timerSeconds > 0) {
      setIsTimerRunning(true);
    } else {
      takePhoto();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Name Prompt Modal */}
      <AnimatePresence>
        {showNamePrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          >
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold mb-4">ברוך הבא לאירוע!</h3>
              <p className="text-gray-600 mb-4">איך תרצה שנקרא לך?</p>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="השם שלך"
                className="mb-4"
              />
              <Button 
                onClick={saveGuestName}
                className="w-full"
                disabled={!guestName.trim()}
              >
                המשך
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera View */}
      <div className="relative flex-1">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: isFrontCamera ? 'scaleX(-1)' : 'none',
                filter: selectedFilter.filter
              }}
            />
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                {Array(9).fill(null).map((_, i) => (
                  <div key={i} className="border border-white/30" />
                ))}
              </div>
            )}
            {isTimerRunning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="text-white text-7xl font-bold">
                  {timerSeconds}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="relative h-full">
            <img
              src={capturedImage}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: selectedFilter.filter }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="הוסף כיתוב..."
                className="bg-white/20 border-none text-white placeholder-white/70"
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!capturedImage ? (
        <>
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/50 text-white"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="flex gap-2">
              {hasFlash && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-black/50 text-white"
                  onClick={() => setIsFlashOn(!isFlashOn)}
                >
                  <Zap className={`h-6 w-6 ${isFlashOn ? 'text-yellow-400' : ''}`} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white"
                onClick={() => setTimerSeconds(timerSeconds === 0 ? 3 : 0)}
              >
                <Timer className={`h-6 w-6 ${timerSeconds > 0 ? 'text-blue-400' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex justify-between items-end mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Sparkles className="h-6 w-6" />
              </Button>

              <Button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white hover:bg-white/90"
              >
                <Camera className="h-8 w-8 text-black" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/50 text-white"
                onClick={() => setIsFrontCamera(!isFrontCamera)}
              >
                <SwitchCamera className="h-6 w-6" />
              </Button>
            </div>

            {/* Filters Scroll */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="overflow-x-auto whitespace-nowrap pb-2"
                >
                  <div className="flex gap-2">
                    {FILTERS.map(filter => (
                      <Button
                        key={filter.id}
                        variant="ghost"
                        className={`rounded-full px-4 py-2 bg-black/50 text-white ${
                          selectedFilter.id === filter.id ? 'border-2 border-white' : ''
                        }`}
                        onClick={() => setSelectedFilter(filter)}
                      >
                        {filter.name}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      ) : (
        // Controls for captured image
        <div className="absolute bottom-20 left-4 right-4 flex justify-center gap-4">
          <Button
            variant="ghost"
            className="rounded-full bg-black/50 text-white"
            onClick={() => setCapturedImage(null)}
          >
            צלם שוב
          </Button>
          <Button
            className="rounded-full bg-blue-500 text-white px-8"
            onClick={uploadPhoto}
            disabled={isUploading}
          >
            {isUploading ? 'שומר...' : 'שמור'}
          </Button>
        </div>
      )}
    </div>
  );
}
