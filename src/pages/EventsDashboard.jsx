
import React, { useState, useEffect, useRef } from 'react';
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  ImageIcon,
  Users,
  Plus,
  Camera,
  Crown,
  Lock,
  DownloadCloud,
  Share2,
  Settings,
  Loader2,
  QrCode,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Event, Post, FaceTag } from '@/api/entities';
import { User } from '@/api/entities';
import Logo from '../components/Logo';
import html2canvas from 'html2canvas';
import QRTemplateMinimal from '../components/qr/QRTemplateMinimal';

export default function EventsDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalVideos: 0,
    totalFaces: 0
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await User.me();
      if (!user) {
        window.location.href = createPageUrl('Welcome');
        return;
      }
      setCurrentUser(user);
      fetchEvents(user.email);
    } catch (error) {
      console.error('Error fetching user:', error);
      window.location.href = createPageUrl('Welcome');
    }
  };

  const fetchEvents = async (email) => {
    try {
      const fetchedEvents = await Event.filter({ owner_email: email }, '-date');
      setEvents(fetchedEvents);
      
      if (fetchedEvents.length > 0) {
        const event = fetchedEvents[0];
        const mediaPosts = await Post.filter({ event_id: event.id });
        const photos = mediaPosts.filter(post => post.type === 'photo');
        const videos = mediaPosts.filter(post => post.type === 'video');
        const faceTags = await FaceTag.filter({ event_id: event.id });
        const uniquePersons = new Set(faceTags.map(face => face.person_name).filter(Boolean));

        setStats({
          totalPhotos: photos.length,
          totalVideos: videos.length,
          totalFaces: uniquePersons.size
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openQrModal = (event) => {
    setSelectedEvent(event);
    setShowQrModal(true);
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    
    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${selectedEvent.title}-QR-Code.png`;
      link.click();
    } catch (error) {
      console.error('Error generating QR image:', error);
      alert('אירעה שגיאה בהורדת ה-QR. נסה שוב.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-pink-600 font-medium">טוען את האירועים שלך...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50/30">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* כותרת ופעולות */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              {events.length > 0 ? 'האירועים שלך' : 'יצירת אירוע חדש'}
            </h1>
            <p className="text-gray-600">
              {events.length > 0 
                ? `${stats.totalPhotos} תמונות, ${stats.totalVideos} סרטונים, ${stats.totalFaces} אנשים מזוהים`
                : 'צור את האירוע הראשון שלך והתחל לאסוף זכרונות'}
            </p>
          </motion.div>
          
          <div className="flex gap-4">
            {currentUser?.is_admin && (
              <Button 
                onClick={() => window.location.href = createPageUrl('AdminDashboard')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl gap-2"
              >
                <Crown className="w-4 h-4" />
                ניהול
              </Button>
            )}
            
            <Button 
              onClick={() => window.location.href = createPageUrl('CreateEvent')}
              className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white rounded-xl gap-2"
            >
              <Plus className="w-4 h-4" />
              אירוע חדש
            </Button>
          </div>
        </div>

        {/* תצוגת אירועים */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img 
                    src={event.cover_image || `https://source.unsplash.com/800x600/?${event.type}`}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-black/40 text-white border-none mb-2">
                        {event.type === 'wedding' && '👰 חתונה'}
                        {event.type === 'bar_mitzvah' && '✡️ בר מצווה'}
                        {event.type === 'bat_mitzvah' && '✡️ בת מצווה'}
                        {event.type === 'brit' && '👶 ברית'}
                        {event.type === 'birthday' && '🎂 יום הולדת'}
                        {event.type === 'party' && '🎉 מסיבה'}
                        {event.type === 'other' && '📅 אירוע אחר'}
                      </Badge>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-white/80">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date ? format(new Date(event.date), 'dd/MM/yyyy') : 'אין תאריך'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {stats.totalPhotos} תמונות
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Users className="w-3 h-3" />
                      {stats.totalFaces} אנשים
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Lock className="w-3 h-3" />
                      קוד: {event.code}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.location.href = createPageUrl('EventView') + `?id=${event.id}`}
                    >
                      <Settings className="w-4 h-4" />
                      ניהול
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => {
                        const eventUrl = `${window.location.origin}${createPageUrl('EventFeed')}?code=${event.code}`;
                        navigator.clipboard.writeText(eventUrl);
                        alert('הקישור הועתק ללוח');
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                      שתף
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openQrModal(event)}
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* QR Modal */}
        {showQrModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">קוד QR לאירוע</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowQrModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div 
                ref={qrRef} 
                className="bg-white p-2 rounded-lg shadow-sm"
              >
                <QRTemplateMinimal 
                  event={selectedEvent}
                  qrData={window.location.origin + createPageUrl('EventFeed') + `?code=${selectedEvent.code}`}
                />
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  className="gap-2 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white"
                  onClick={downloadQR}
                >
                  <DownloadCloud className="w-4 h-4" />
                  הורד QR Code
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* תצוגת ריקה */}
        {events.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 text-center"
          >
            <div className="max-w-md mx-auto py-12">
              <motion.div 
                className="w-24 h-24 mx-auto bg-gradient-to-r from-pink-400 to-violet-500 rounded-full flex items-center justify-center mb-6"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Camera className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-4">אין לך עדיין אירועים</h3>
              <p className="text-gray-600 mb-8">
                צור את האירוע הראשון שלך והתחל לאסוף זכרונות מיוחדים.
                אנחנו נעזור לך ליצור חוויה בלתי נשכחת.
              </p>
              <Button
                onClick={() => window.location.href = createPageUrl('CreateEvent')}
                className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white px-8 py-6 rounded-xl gap-2 text-lg"
              >
                <Plus className="w-5 h-5" />
                צור אירוע חדש
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
