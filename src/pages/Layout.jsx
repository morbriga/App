

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, User, LogOut, Heart, Shield, ArrowLeft, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { User as UserEntity } from '@/api/entities';
import { cn } from "@/lib/utils";
import Logo from './components/Logo';

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    // הוספת גופנים דינמית לדף
    const linkGreatVibes = document.createElement('link');
    linkGreatVibes.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap';
    linkGreatVibes.rel = 'stylesheet';
    document.head.appendChild(linkGreatVibes);
    
    const linkPlayfair = document.createElement('link');
    linkPlayfair.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap';
    linkPlayfair.rel = 'stylesheet';
    document.head.appendChild(linkPlayfair);
    
    return () => {
      document.head.removeChild(linkGreatVibes);
      document.head.removeChild(linkPlayfair);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await UserEntity.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    
    // בדיקה אם אנחנו במצב אורח (בדף אירוע)
    const urlParams = new URLSearchParams(window.location.search);
    const eventCode = urlParams.get('code');
    
    if (eventCode && (currentPageName === 'EventFeed' || currentPageName === 'GuestEntry')) {
      setIsGuestMode(true);
    } else {
      setIsGuestMode(false);
    }
  }, [currentPageName]);

  // הוספת style גלובלי שימנע העתקת טקסט ותמונות
  useEffect(() => {
    // הוספת סגנונות למניעת העתקה
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
        pointer-events: none;
      }
      
      /* אפשר העתקה בשדות קלט */
      input, textarea {
        -webkit-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      
      /* אפשר העתקה בקודי QR ודברים שחייבים להעתיק */
      .allow-select {
        -webkit-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      
      .allow-copy {
        -webkit-user-select: text;
        -ms-user-select: text;
        user-select: text;
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);

    // מניעת קליק ימני
    const handleContextMenu = (e) => {
      // אפשר קליק ימני על אלמנטים עם הקלאס allow-copy
      if (!e.target.closest('.allow-copy')) {
        e.preventDefault();
      }
    };
    
    // מניעת צירופי מקשים להעתקה
    const handleKeyDown = (e) => {
      // אפשר העתקה באלמנטים עם הקלאס allow-copy
      if (e.target.closest('.allow-copy')) return;
      
      // מניעת CTRL+C, CTRL+V, CTRL+X, CTRL+S
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 's')) {
        e.preventDefault();
      }
      
      // מניעת CMD+C, CMD+V, CMD+X, CMD+S במקינטוש
      if (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 's')) {
        e.preventDefault();
      }
      
      // מניעת Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await UserEntity.login({
        provider: 'google',
        redirectUrl: window.location.href,
        scope: 'email profile',
        prompt: 'select_account'
      });
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
      setCurrentUser(null);
      // אחרי התנתקות, נחזיר את המשתמש לדף הבית
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isLandingPage = currentPageName === 'Home';
  
  // בדיקה אם אנחנו בדף הראשי
  if (isLandingPage) {
    return (
      <div dir="rtl">
        {children}
      </div>
    );
  }

  // בדיקה אם יש קוד אירוע ב-URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventCode = urlParams.get('code');
  
  // אם אין קוד אירוע ואנחנו בדף EventFeed, נחזיר לדף הבית
  if (currentPageName === 'EventFeed' && !eventCode) {
    window.location.href = createPageUrl('Home');
    return null;
  }

  // תצוגה במצב אורח - רק כפתור חזרה לדף הבית
  if (isGuestMode) {
    return (
      <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                  <Logo className="w-8 h-8" />
                  <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
                    BeventX
                  </span>
                </Link>
              </div>

              {/* Guest Navigation */}
              <nav className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = createPageUrl('Home')}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  חזרה לדף הבית
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <Logo className="w-8 h-8" />
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
                  BeventX
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {currentUser ? (
                <>
                  <Link 
                    to={createPageUrl('CreateEvent')} 
                    className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    יצירת אירוע
                  </Link>
                  <Link 
                    to={createPageUrl('EventsDashboard')} 
                    className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  >
                    האירועים שלי
                  </Link>
                  {/* הוספת לינק להגדרות */}
                  <Link 
                    to={createPageUrl('UserSettings')} 
                    className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    הגדרות
                  </Link>
                  {currentUser.is_admin && (
                    <Link 
                      to={createPageUrl('AdminDashboard')} 
                      className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                    >
                      ניהול
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    התנתק
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white"
                >
                  התחבר
                </Button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-white border-b shadow-lg z-40">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4">
              {currentUser ? (
                <>
                  <Link 
                    to={createPageUrl('CreateEvent')} 
                    className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    יצירת אירוע
                  </Link>
                  <Link 
                    to={createPageUrl('EventsDashboard')} 
                    className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    האירועים שלי
                  </Link>
                  {/* הוספת לינק להגדרות במובייל */}
                  <Link 
                    to={createPageUrl('UserSettings')} 
                    className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    הגדרות
                  </Link>
                  {currentUser.is_admin && (
                    <Link 
                      to={createPageUrl('AdminDashboard')} 
                      className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      ניהול
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="justify-start gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    התנתק
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white"
                >
                  התחבר
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

