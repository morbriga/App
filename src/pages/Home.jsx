
import React from 'react';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { User as UserEntity } from '@/api/entities';
import { motion } from "framer-motion";
import { HeartIcon, Camera, SparklesIcon, UsersIcon, ImageIcon, CalendarIcon } from 'lucide-react';
import Logo from '../components/Logo';

import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    photos: 0,
    videos: 0
  });

  useEffect(() => {
    // פונקציה שמייצרת מספר אקראי בטווח
    const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // פונקציה שמעדכנת את המספרים כל כמה שניות
    const updateStats = () => {
      const currentHour = new Date().getHours();
      
      // מספרים שונים לפי שעות היום
      let basePhotos;
      if (currentHour >= 20 || currentHour < 6) {
        // לילה - פחות פעילות
        basePhotos = getRandomInRange(50, 150);
      } else if (currentHour >= 12 && currentHour < 16) {
        // שעות השיא
        basePhotos = getRandomInRange(400, 800);
      } else {
        // שעות רגילות
        basePhotos = getRandomInRange(200, 500);
      }
      
      // וידאו תמיד יהיה כ-20% מכמות התמונות
      const baseVideos = Math.floor(basePhotos * 0.2);
      
      setStats({
        photos: basePhotos,
        videos: baseVideos
      });
    };
    
    // עדכון ראשוני
    updateStats();
    
    // עדכון כל 5 דקות
    const interval = setInterval(updateStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleGetStarted = async () => {
    try {
      // בדוק אם המשתמש כבר מחובר
      const user = await UserEntity.me();
      if (user) {
        // אם כן, נפנה אותו ישירות ליצירת אירוע
        window.location.href = createPageUrl('CreateEvent');
      } else {
        // אם לא, נפנה אותו לדף ברוכים הבאים
        window.location.href = createPageUrl('Welcome');
      }
    } catch (error) {
      // אם יש שגיאה (משתמש לא מחובר), נפנה לדף ברוכים הבאים
      window.location.href = createPageUrl('Welcome');
    }
  };
  
  const handleJoinEvent = () => {
    // מעבר לדף הזנת קוד אירוע לאורחים
    window.location.href = createPageUrl('GuestEntry');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 1.2 }
    }
  };
  
  const heroImageVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 50, duration: 1.2 }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header - משפרים את הרספונסיביות */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Logo className="w-10 h-10" />
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">BeventX</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-3"
          >
            <Button 
              onClick={handleJoinEvent}
              variant="outline"
              className="rounded-full px-4 md:px-6 py-2 md:py-6 text-sm md:text-base border-pink-200 text-pink-700 hover:bg-pink-50 hidden sm:inline-flex"
            >
              הצטרף לאירוע
            </Button>
            <Button 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white rounded-full px-4 md:px-6 py-2 md:py-6 text-sm md:text-base shadow-lg shadow-pink-500/20"
            >
              <span className="hidden sm:inline">צור אירוע חדש</span>
              <span className="sm:hidden">צור אירוע</span>
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 lg:pt-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-purple-50 to-white"></div>
        
        {/* Decorative Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-r from-pink-200 to-purple-200 opacity-20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute bottom-40 right-10 w-72 h-72 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 opacity-20 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -10, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
        
        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="flex flex-col lg:flex-row items-center gap-8 md:gap-16 py-10 md:py-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex-1 text-center lg:text-right">
              <motion.h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-8 leading-tight"
                variants={itemVariants}
              >
                יוצרים זיכרונות
                <br />
                <span className="bg-gradient-to-r from-pink-600 to-violet-600 text-transparent bg-clip-text">
                  לאירוע שלכם
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-600 mb-6 md:mb-10"
                variants={itemVariants}
              >
                האפליקציה שהופכת כל אירוע לחוויה בלתי נשכחת.
                <br className="hidden md:block" />
                תמונות, רגעים, וזיכרונות - הכל במקום אחד.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center lg:justify-end mb-10 lg:mb-0">
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white text-base md:text-lg rounded-full px-6 md:px-10 py-5 md:py-7 shadow-xl shadow-pink-500/20 transition-all duration-300 hover:scale-105"
                >
                  התחל עכשיו - בחינם
                </Button>
                <Button
                  onClick={handleJoinEvent}
                  variant="outline"
                  className="border-pink-300 text-pink-700 hover:bg-pink-50 text-base md:text-lg rounded-full px-6 md:px-10 py-5 md:py-7 transition-all duration-300 hover:scale-105"
                >
                  הצטרף כאורח
                </Button>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex-1 w-full max-w-lg lg:max-w-none mx-auto"
              variants={heroImageVariants}
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-violet-600 rounded-3xl blur opacity-30"></div>
                <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                  {/* התמונה המרכזית - עם שיפור יחס גובה-רוחב במובייל */}
                  <div className="aspect-[4/3] md:aspect-auto">
                    <img 
                      src="https://i.imgur.com/I8M69c2.jpg" 
                      alt="חתונה מהממת"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* התמונה העליונה - משפרים את המיקום במובייל */}
                  <motion.div 
                    className="absolute top-4 md:top-10 -right-4 md:-right-10 rotate-12 w-28 md:w-48 shadow-xl rounded-lg overflow-hidden"
                    initial={{ opacity: 0, x: 20, rotate: 20 }}
                    animate={{ opacity: 1, x: 0, rotate: 12 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <img 
                      src="https://i.imgur.com/S1YVqVT.jpg" 
                      alt="זוג שמח"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  
                  {/* התמונה התחתונה - משפרים את המיקום במובייל */}
                  <motion.div 
                    className="absolute bottom-4 md:bottom-10 -left-4 md:-left-10 -rotate-12 w-28 md:w-48 shadow-xl rounded-lg overflow-hidden"
                    initial={{ opacity: 0, x: -20, rotate: -20 }}
                    animate={{ opacity: 1, x: 0, rotate: -12 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  >
                    <img 
                      src="https://i.imgur.com/pS60QyE.jpg" 
                      alt="ריקודים בחתונה"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
                
                <motion.div 
                  className="absolute -bottom-6 right-4 left-4 glass-effect backdrop-blur-md rounded-2xl p-3 md:p-5 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
                    <div className="flex -space-x-4 space-x-reverse">
                      <img className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80" alt="User" />
                      <img className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80" alt="User" />
                      <img className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80" alt="User" />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 text-center md:text-right">
                      <div className="flex flex-wrap justify-center md:justify-start items-center gap-1 md:gap-2">
                        <span className="text-xs md:text-sm font-medium text-violet-600">
                          +{stats.photos.toLocaleString()} תמונות
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 hidden md:inline">|</span>
                        <span className="text-xs md:text-sm font-medium text-pink-600">
                          +{stats.videos.toLocaleString()} סרטונים
                        </span>
                        <span className="text-xs md:text-sm text-gray-500 font-medium">שותפו היום</span>
                      </div>
                      <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full text-white text-sm font-medium shrink-0">
                        <HeartIcon className="w-3 h-3 md:w-4 md:h-4" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ממשיכים עם שאר העמוד כפי שהוא */}
      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-violet-600 text-transparent bg-clip-text">איך זה עובד?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              הפלטפורמה שלנו עוזרת לכם לאסוף, לארגן ולשתף את כל הרגעים המיוחדים מהאירוע שלכם בקלות
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-xl shadow-pink-500/5 hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">צילום חכם</h3>
              <p className="text-gray-600">צלמו תמונות וסרטונים ישירות מהאפליקציה עם פילטרים מהממים ואפקטים מיוחדים</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">שיתוף בזמן אמת</h3>
              <p className="text-gray-600">כל האורחים יכולים לצלם ולשתף תמונות שמתווספות מיד לאלבום המשותף של האירוע</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-2xl p-8 shadow-xl shadow-violet-500/5 hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">זיהוי חכם</h3>
              <p className="text-gray-600">מערכת AI מתקדמת מזהה אנשים ומארגנת תמונות לפי פנים ורגעים מיוחדים</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-gradient-to-r from-pink-900 to-violet-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">שלושה צעדים פשוטים</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              תהליך יצירת האירוע הוא פשוט וקל - תוך דקות תוכלו להתחיל לאסוף זכרונות
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <motion.div 
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-sm w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">צור אירוע</h3>
              <p className="text-white/80">
                צור את האירוע שלך בקלות וקבל קוד ייחודי לשיתוף
              </p>
              <div className="hidden md:block absolute top-1/2 right-0 w-full border-t border-dashed border-white/20"></div>
            </motion.div>
            
            <motion.div 
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-sm w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">הזמן אורחים</h3>
              <p className="text-white/80">
                שתף את הקוד והקישור עם האורחים בהזמנות ובמדיה חברתית
              </p>
              <div className="hidden md:block absolute top-1/2 right-0 w-full border-t border-dashed border-white/20"></div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-sm w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-4xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">צלמו ושתפו</h3>
              <p className="text-white/80">
                כל האורחים יכולים לצלם, לערוך ולשתף תמונות וסרטונים מהאירוע
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full opacity-30 blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
        
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-violet-200 to-blue-200 rounded-full opacity-30 blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-violet-600 text-transparent bg-clip-text">
              מוכנים ליצור אירוע בלתי נשכח?
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              צרו את האירוע הראשון שלכם ב-BeventX והפכו אותו לחוויה משותפת ומיוחדת
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white text-xl rounded-full px-12 py-8 shadow-2xl shadow-pink-500/20 transition-all duration-300 hover:scale-105"
            >
              התחילו עכשיו - בחינם
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">BeventX</span>
            </div>
            <div className="flex gap-8 text-gray-600">
              <a href="#" className="hover:text-pink-600 transition-colors">תנאי שימוש</a>
              <a href="#" className="hover:text-pink-600 transition-colors">פרטיות</a>
              <a href="#" className="hover:text-pink-600 transition-colors">צור קשר</a>
              <a href={createPageUrl('AdminDashboard')} className="hover:text-pink-600 transition-colors">כניסת מנהלים</a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500">
            © {new Date().getFullYear()} BeventX. כל הזכויות שמורות.
          </div>
        </div>
      </footer>
    </div>
  );
}
