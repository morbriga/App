
import React, { useState, useEffect, useRef } from 'react';
import { createPageUrl } from "@/utils";
import { Event, Post, FaceTag } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Users, Tag, FileText, Calendar, ArrowLeft, Share2, Edit, Trash2, DownloadCloud, QrCode, X } from 'lucide-react';
import { format } from 'date-fns';
import PostGrid from '../components/posts/PostGrid';
import MomentStories from '../components/stories/MomentStories';
import FaceRecognition from '../components/ai/FaceRecognition';
import AlbumSection from '../components/albums/AlbumSection';
import html2canvas from 'html2canvas';
import Logo from '../components/Logo';
import QRTemplateMinimal from '../components/qr/QRTemplateMinimal';

export default function EventView() {
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faceTags, setFaceTags] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");
  const [showQrModal, setShowQrModal] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
      window.location.href = createPageUrl('EventsDashboard');
      return;
    }
    
    loadEvent(eventId);
    fetchCurrentUser();
  }, []);
  
  const fetchCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };
  
  const loadEvent = async (eventId) => {
    try {
      const eventData = await Event.get(eventId);
      setEvent(eventData);
      
      // Check if current user is the owner
      const user = await User.me();
      setIsOwner(user.email === eventData.owner_email);
      
      // Load posts and face tags
      const eventPosts = await Post.filter({ event_id: eventId }, '-created_date');
      setPosts(eventPosts);
      
      const tags = await FaceTag.filter({ event_id: eventId });
      setFaceTags(tags);
      
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFacesDetected = (faces) => {
    // Update faceTags with the newly detected faces
    setFaceTags(prevTags => {
      const newTags = [];
      
      // Add face instances that have been named
      for (const face of faces) {
        if (face.person_name) {
          for (const instance of face.instances) {
            newTags.push({
              post_id: instance.post_id,
              event_id: instance.event_id,
              person_name: face.person_name,
              face_id: face.face_id,
              bounding_box: instance.bounding_box
            });
          }
        }
      }
      
      return [...prevTags, ...newTags];
    });
  };
  
  const shareEvent = () => {
    const eventUrl = `${window.location.origin}${createPageUrl('EventFeed')}?code=${event.code}`;
    navigator.clipboard.writeText(eventUrl);
    alert('הקישור הועתק ללוח');
  };

  const deletePost = async (postId) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תמונה זו?')) return;
    
    try {
      await Post.delete(postId);
      // Update posts list after deletion
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const qrRef = useRef(null);
  
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
      link.download = `${event.title}-QR-Code.png`;
      link.click();
    } catch (error) {
      console.error('Error generating QR image:', error);
      alert('אירעה שגיאה בהורדת ה-QR. נסה שוב.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="min-h-screen bg-purple-50 p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">האירוע לא נמצא</h1>
        <Button onClick={() => window.location.href = createPageUrl('EventsDashboard')}>
          חזרה לדף הבית
        </Button>
      </div>
    );
  }
  
  const eventTypeToHebrew = (type) => {
    const types = {
      'wedding': 'חתונה',
      'bar_mitzvah': 'בר מצווה',
      'bat_mitzvah': 'בת מצווה',
      'brit': 'ברית',
      'corporate': 'אירוע חברה',
      'other': 'אחר'
    };
    return types[type] || type;
  };
  
  const getCoverImage = (event) => {
    if (event.cover_image) {
      return event.cover_image;
    }
    
    // Default images by event type
    const defaults = {
      'wedding': 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070',
      'bar_mitzvah': 'https://images.unsplash.com/photo-1560439396-d96eca6a8724?q=80&w=2070',
      'bat_mitzvah': 'https://images.unsplash.com/photo-1524069290683-0457abfe42c3?q=80&w=2070',
      'brit': 'https://images.unsplash.com/photo-1564836235910-c3a17cf2727e?q=80&w=2070',
      'corporate': 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2070',
      'other': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070'
    };
    
    return defaults[event.type] || defaults.other;
  };
  
  return (
    <div className="min-h-screen bg-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => window.location.href = createPageUrl('EventsDashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
            חזרה לאירועים
          </Button>
        </div>
        
        {/* Event Header */}
        <div className="mb-8">
          <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-6">
            <img 
              src={getCoverImage(event)} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 right-0 p-6">
              <Badge className="bg-black/50 text-white border-none mb-2">
                {eventTypeToHebrew(event.type)}
              </Badge>
              <h1 className="text-3xl font-bold text-white mb-1">{event.title}</h1>
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span>{event.date ? format(new Date(event.date), 'dd/MM/yyyy') : 'ללא תאריך'}</span>
              </div>
            </div>
            
            {isOwner && (
              <div className="absolute top-4 left-4 flex gap-2">
                <Button 
                  className="gap-1 bg-black/50 hover:bg-black/70"
                  onClick={shareEvent}
                >
                  <Share2 className="w-4 h-4" />
                  שתף
                </Button>
                <Button 
                  variant="outline"
                  className="gap-1 bg-white/90 hover:bg-white border-none"
                  onClick={() => window.location.href = createPageUrl('CreateEvent') + `?edit=${event.id}`}
                >
                  <Edit className="w-4 h-4" />
                  ערוך
                </Button>
              </div>
            )}
          </div>
          
          {/* Event Info */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">תמונות וסרטונים</p>
                <p className="font-semibold">{posts.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">אנשים שזוהו</p>
                <p className="font-semibold">{new Set(faceTags.map(tag => tag.person_name).filter(Boolean)).size}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <Tag className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">קוד אירוע</p>
                <p className="font-semibold">{event.code}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Content */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white p-1 shadow-sm">
            <TabsTrigger value="feed" className="data-[state=active]:bg-primary-light data-[state=active]:text-primary">פיד</TabsTrigger>
            <TabsTrigger value="people" className="data-[state=active]:bg-primary-light data-[state=active]:text-primary">אנשים</TabsTrigger>
            <TabsTrigger value="albums" className="data-[state=active]:bg-primary-light data-[state=active]:text-primary">אלבומים</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-8">
            {/* Stories/Moments */}
            <MomentStories posts={posts} />
            
            {/* Main Feed */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-xl">כל התמונות והסרטונים</CardTitle>
                {isOwner && (
                  <Button variant="outline" className="gap-2">
                    <DownloadCloud className="w-4 h-4" />
                    הורדת כל התמונות
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <PostGrid 
                  posts={posts} 
                  showName={true} 
                  faceTags={faceTags} 
                  onDeletePost={isOwner ? deletePost : null}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="people" className="space-y-8">
            {isOwner && (
              <FaceRecognition event={event} onFacesDetected={handleFacesDetected} />
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">אנשים באירוע</CardTitle>
              </CardHeader>
              <CardContent>
                {faceTags.length > 0 ? (
                  <AlbumSection 
                    title="אנשים" 
                    posts={posts} 
                    faceTags={faceTags} 
                  />
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">אין אנשים מזוהים</h3>
                    <p className="text-gray-500 mb-4">השתמש בזיהוי פנים כדי לזהות אנשים בתמונות</p>
                    {isOwner && (
                      <Button 
                        onClick={() => setActiveTab("people")}
                        className="gap-2"
                      >
                        <Users className="w-4 h-4" />
                        זהה פנים
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="albums" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">אלבומים לפי נושא</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <AlbumSection 
                  title="חופה וטקס" 
                  posts={posts.filter(post => post.moment_type === 'ceremony')} 
                  faceTags={faceTags}
                />
                
                <AlbumSection 
                  title="ריקודים" 
                  posts={posts.filter(post => post.moment_type === 'dance')} 
                  faceTags={faceTags}
                />
                
                <AlbumSection 
                  title="משפחה" 
                  posts={posts.filter(post => post.moment_type === 'family')} 
                  faceTags={faceTags}
                />
                
                <AlbumSection 
                  title="חברים" 
                  posts={posts.filter(post => post.moment_type === 'friends')} 
                  faceTags={faceTags}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Public Sharing */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">שיתוף האירוע</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-gray-50 rounded-lg p-6">
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg mb-1">קוד האירוע</h3>
                  <p className="text-sm text-gray-500">שתפו את הקוד הזה עם האורחים</p>
                </div>
                <div className="bg-white border rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold tracking-wider">{event.code}</p>
                </div>
              </div>
              
              <div className="flex-1 bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-lg mb-4">קישור לאירוע</h3>
                <div className="bg-white border rounded-lg p-3 mb-4 overflow-auto">
                  <p className="text-sm truncate">
                    {window.location.origin + createPageUrl('EventFeed') + `?code=${event.code}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button className="gap-2" onClick={shareEvent}>
                    <Share2 className="w-4 h-4" />
                    שתף קישור
                  </Button>
                  <Button className="gap-2" variant="outline" onClick={() => setShowQrModal(true)}>
                    <QrCode className="w-4 h-4" />
                    הצג QR Code
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-[95vw] sm:w-auto max-w-md">
            <div className="flex justify-between items-center p-3 sm:p-4 border-b">
              <h3 className="text-lg sm:text-xl font-bold">קוד QR לאירוע</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowQrModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div 
              ref={qrRef} 
              className="bg-white"
            >
              <QRTemplateMinimal 
                event={event} 
                qrData={window.location.origin + createPageUrl('EventFeed') + `?code=${event.code}`} 
              />
            </div>
            
            <div className="p-3 sm:p-4 border-t">
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white"
                onClick={downloadQR}
              >
                <DownloadCloud className="w-4 h-4" />
                הורד QR Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
