
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Event, Post, GuestUser } from '@/api/entities';
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import SimpleCameraComponent from '../components/camera/SimpleCameraComponent';
import { format } from 'date-fns';
import { 
  Heart, MessageCircle, ArrowUp, Camera, Share2, 
  Bookmark, Music2, Sparkles, Zap, Camera as CameraIcon, 
  Smile, Users, Star, Download, Award, Image as ImageIcon,
  Play, Film, Pause, Volume2, VolumeX, MoreHorizontal,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from '../components/Logo';

export default function EventFeed() {
  // Core states
  const [event, setEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [activeView, setActiveView] = useState('feed');  // 'feed', 'reels', 'moments' or 'featured'
  
  // User interaction states
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [currentExpanded, setCurrentExpanded] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState({});
  const [muted, setMuted] = useState(false);
  const [musicPlayer, setMusicPlayer] = useState({ visible: false, playing: false });
  const [filterTags, setFilterTags] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [confettiActive, setConfettiActive] = useState(false);
  const videoRefs = useRef({});
  const feedRef = useRef(null);
  const reelsRef = useRef(null);
  const currentStorySet = useRef(null);
  const storyProgressTimer = useRef(null);
  
  // Animation controls
  const feedOpacity = useMotionValue(1);
  const reelsOpacity = useMotionValue(0);
  const feedScale = useTransform(feedOpacity, [0, 1], [0.9, 1]);
  const reelsScale = useTransform(reelsOpacity, [0, 1], [0.9, 1]);
  const swipeY = useMotionValue(0);
  const reelBgOpacity = useTransform(swipeY, [0, -100], [0, 0.8]);
  const [guestUser, setGuestUser] = useState(null);

  // בדיקה אם יש לאורח שם
  useEffect(() => {
    const checkGuestName = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const eventCode = urlParams.get('code');
      
      if (!eventCode) return;
      
      const guestName = localStorage.getItem(`guestName_${eventCode}`);
      const guestId = localStorage.getItem(`guestId_${eventCode}`);
      
      if (!guestName || !guestId) {
        // אין שם אורח, מעביר לדף הזנת שם
        window.location.href = createPageUrl('GuestEntry') + `?code=${eventCode}`;
      }
    };
    
    checkGuestName();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventCode = urlParams.get('code');
    
    if (!eventCode) {
      window.location.href = createPageUrl('Home');
      return;
    }

    // Simulate progress loading for better UX
    const loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + (100 - prev) * 0.1;
        return newProgress > 99 ? 99 : newProgress;
      });
    }, 100);
    
    loadEvent(eventCode).then(() => {
      clearInterval(loadingInterval);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3000);
      }, 500);
    });
    
    // Add smooth scroll behavior
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const loadGuestInfo = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const eventCode = urlParams.get('code');
      
      if (!eventCode) return;

      const guestId = localStorage.getItem(`guestId_${eventCode}`);
      if (guestId) {
        try {
          const guests = await GuestUser.filter({ 
            guest_id: guestId,
            event_id: eventCode 
          });
          if (guests.length > 0) {
            setGuestUser(guests[0]);
          }
        } catch (error) {
          console.error('Error loading guest info:', error);
        }
      }
    };

    loadGuestInfo();
  }, []);
  
  const loadEvent = async (eventCode) => {
    try {
      const events = await Event.filter({ code: eventCode });
      if (events.length === 0) {
        window.location.href = createPageUrl('Home');
        return;
      }

      const currentEvent = events[0];
      setEvent(currentEvent);

      const eventPosts = await Post.filter({ event_id: currentEvent.id }, '-created_date');
      setPosts(eventPosts);
      
      // Extract unique tags/categories from posts
      const tags = Array.from(
        new Set(
          eventPosts
            .map(post => post.moment_type)
            .filter(Boolean)
        )
      );
      setFilterTags(['all', ...tags]);
    } catch (error) {
      console.error('Error loading event:', error);
      window.location.href = createPageUrl('Home');
    }
  };
  
  const handleNewPost = async (postData) => {
    if (!event) return;

    try {
      // Get the guest info from localStorage
      const guestName = localStorage.getItem(`guestName_${event.code}`);
      const guestId = localStorage.getItem(`guestId_${event.code}`);
      
      // Build the complete post data
      const newPostData = {
        ...postData,
        event_id: event.id,
        guest_name: guestName || postData.guest_name || "אורח",
        guest_id: guestId || postData.guest_id || null
      };
      
      console.log("Creating post with data:", newPostData); // Debugging
      
      const newPost = await Post.create(newPostData);
      
      // Add to posts list
      setPosts(prev => [newPost, ...prev]);
      
      // Trigger confetti for celebration
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 2000);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('שגיאה ביצירת הפוסט. נסה שוב.');
    }
  };

  const toggleLike = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    // Add heart animation effect here
  };
  
  const toggleSave = (postId) => {
    setSavedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  const toggleExpand = (postId) => {
    if (currentExpanded === postId) {
      setCurrentExpanded(null);
      setShowComments(false);
    } else {
      setCurrentExpanded(postId);
      
      // Pause all videos when expanding a new post
      Object.keys(videoRefs.current).forEach(key => {
        if (videoRefs.current[key]) {
          videoRefs.current[key].pause();
        }
      });
      
      // If this is a video post, play it
      const post = posts.find(p => p.id === postId);
      if (post?.type === 'video' && videoRefs.current[postId]) {
        videoRefs.current[postId].play();
      }
    }
  };
  
  const handleCommentSubmit = (postId) => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      username: "אורח",
      timestamp: new Date()
    };
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    
    setCommentText('');
  };
  
  const changeView = (view) => {
    setActiveView(view);
    
    // Animate transition between views
    if (view === 'feed') {
      feedOpacity.set(1);
      reelsOpacity.set(0);
    } else if (view === 'reels') {
      feedOpacity.set(0);
      reelsOpacity.set(1);
      
      // Auto-play the first reel
      const videoElements = posts.filter(post => post.type === 'video');
      if (videoElements.length > 0 && videoRefs.current[videoElements[0].id]) {
        videoRefs.current[videoElements[0].id].play();
      }
    }
  };
  
  const getFilteredPosts = () => {
    if (activeFilter === 'all') return posts;
    return posts.filter(post => post.moment_type === activeFilter);
  };
  
  const videoPosts = useMemo(() => posts.filter(post => post.type === 'video'), [posts]);
  
  const featuredPosts = useMemo(() => {
    // Select top posts (could be based on likes or other metrics in a real app)
    return posts.slice(0, Math.min(5, posts.length));
  }, [posts]);

  // Custom Confetti component
  const Confetti = () => {
    if (!confettiActive) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array(50).fill().map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#FF3366', '#36D1DC', '#5B86E5', '#FFD26F'][i % 4],
              top: `${Math.random() * 20}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ 
              y: `${Math.random() * 100 + 100}vh`, 
              opacity: [0, 1, 0],
              x: (Math.random() - 0.5) * 200
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500">
        <Logo className="w-20 h-20 mb-8 animate-pulse" />
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ ease: "easeInOut" }}
          />
        </div>
        <p className="text-white/80 mt-4">טוען את האירוע...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f2f5] to-white">
      <title>
        מצלמה משולבת עם אפשרויות
      </title>
      <Confetti />
      
      {/* Event Header with gradient animation */}
      <motion.header 
        className="sticky top-0 z-40 backdrop-blur-lg border-b border-gray-200"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeView !== 'feed' ? (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => changeView('feed')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Logo className="w-8 h-8" />
            )}
            
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
                {event?.title}
              </h1>
              
              {activeView === 'feed' && (
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-normal">
                    {event?.code}
                  </Badge>
                  <span>•</span>
                  <span>{posts.length} רגעים</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowCamera(true)}
            >
              <Camera className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {activeView === 'feed' && (
          <ScrollArea className="whitespace-nowrap border-t border-gray-100" orientation="horizontal">
            <div className="flex p-2 px-4 gap-2">
              {filterTags.map((tag) => (
                <Button
                  key={tag}
                  variant={activeFilter === tag ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-full px-4 ${
                    activeFilter === tag 
                      ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white border-none'
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => setActiveFilter(tag)}
                >
                  {tag === 'all' && 'הכל'}
                  {tag === 'ceremony' && (
                    <><Sparkles className="w-3 h-3 mr-1" /> טקס</>
                  )}
                  {tag === 'dance' && (
                    <><Music2 className="w-3 h-3 mr-1" /> ריקודים</>
                  )}
                  {tag === 'family' && (
                    <><Users className="w-3 h-3 mr-1" /> משפחה</>
                  )}
                  {tag === 'friends' && (
                    <><Smile className="w-3 h-3 mr-1" /> חברים</>
                  )}
                  {!['all', 'ceremony', 'dance', 'family', 'friends'].includes(tag) && tag}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </motion.header>

      {/* Main Content with Views */}
      <main className="relative min-h-[calc(100vh-8rem)]">
        {/* Feed View */}
        <motion.div 
          style={{ opacity: feedOpacity, scale: feedScale }}
          className="pb-20"
          ref={feedRef}
        >
          {/* Featured Stories Row */}
          <div className="max-w-2xl mx-auto px-4 py-4">
            <ScrollArea className="w-full" orientation="horizontal">
              <div className="flex gap-4 pb-2">
                {featuredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => toggleExpand(post.id)}
                  >
                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-pink-500 to-violet-500">
                      <div className="bg-white p-[1px] rounded-full h-full w-full">
                        <div className="rounded-full overflow-hidden h-full w-full">
                          <img
                            src={post.media_url}
                            alt=""
                            className="h-full w-full object-cover"
                            style={{ filter: post.filter || 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs mt-1 text-gray-800">
                      {post.moment_type || `רגע ${index + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main Feed - Card UI */}
          <div className="max-w-2xl mx-auto px-4 space-y-6">
            {getFilteredPosts().map((post) => (
              <motion.div
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Post Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                      {post.guest_name?.[0]?.toUpperCase() || "א"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{post.guest_name || "אורח"}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(post.created_date || new Date()), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Post Media */}
                <div 
                  className="relative aspect-square bg-black"
                  onClick={() => toggleExpand(post.id)}
                >
                  {post.type === 'photo' ? (
                    <img
                      src={post.media_url}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: post.filter || 'none' }}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        ref={el => videoRefs.current[post.id] = el}
                        src={post.media_url}
                        className="w-full h-full object-cover"
                        style={{ filter: post.filter || 'none' }}
                        loop
                        muted={muted}
                        playsInline
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        {currentExpanded !== post.id && (
                          <div className="bg-black/40 backdrop-blur-sm rounded-full p-4">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {currentExpanded === post.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm rounded-full text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMuted(!muted);
                          }}
                        >
                          {muted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {post.caption && (
                    <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm">{post.caption}</p>
                    </div>
                  )}
                </div>
                
                {/* Post Actions */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button 
                        className="flex items-center gap-1" 
                        onClick={() => toggleLike(post.id)}
                      >
                        <div className="relative">
                          {likedPosts[post.id] ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                type: "spring", 
                                stiffness: 500,
                                damping: 10
                              }}
                            >
                              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                            </motion.div>
                          ) : (
                            <Heart className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-sm">12</span>
                      </button>
                      
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => {
                          toggleExpand(post.id);
                          setShowComments(true);
                        }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{(comments[post.id]?.length || 0) + 3}</span>
                      </button>
                      
                      <button className="flex items-center gap-1">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button onClick={() => toggleSave(post.id)}>
                      {savedPosts[post.id] ? (
                        <Bookmark className="w-5 h-5 fill-black" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Caption and Comments Preview */}
                  {post.caption && currentExpanded !== post.id && (
                    <div className="text-sm">
                      <span className="font-semibold">רגע מיוחד</span>{' '}
                      <span className="text-gray-700">
                        {post.caption.length > 80 
                          ? post.caption.substring(0, 80) + '...'
                          : post.caption
                        }
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Expanded Post View */}
        <AnimatePresence>
          {currentExpanded && (
            <motion.div
              className="fixed inset-0 z-50 flex flex-col bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => toggleExpand(currentExpanded)}
                >
                  <X className="w-6 h-6" />
                </Button>
                <h2 className="font-medium">פוסט</h2>
                <div className="w-10"></div> {/* Spacer for alignment */}
              </div>
              
              <div className="flex-1 overflow-auto">
                {(() => {
                  const post = posts.find(p => p.id === currentExpanded);
                  if (!post) return null;
                  
                  return (
                    <div className="max-w-xl mx-auto w-full pb-20">
                      {/* Post Header */}
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold">
                            {post.moment_type?.[0]?.toUpperCase() || "R"}
                          </div>
                          <div>
                            <p className="font-medium">{post.moment_type || "רגע מיוחד"}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(post.created_date || new Date()), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      {/* Post Media */}
                      <div className="relative aspect-square bg-black">
                        {post.type === 'photo' ? (
                          <img
                            src={post.media_url}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{ filter: post.filter || 'none' }}
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              ref={el => videoRefs.current[post.id] = el}
                              src={post.media_url}
                              className="w-full h-full object-cover"
                              style={{ filter: post.filter || 'none' }}
                              controls
                              autoPlay
                              loop
                              muted={muted}
                              playsInline
                            />
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute bottom-16 right-3 bg-black/30 backdrop-blur-sm rounded-full text-white"
                              onClick={() => setMuted(!muted)}
                            >
                              {muted ? (
                                <VolumeX className="w-5 h-5" />
                              ) : (
                                <Volume2 className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Post Actions */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <button 
                              className="flex items-center gap-1" 
                              onClick={() => toggleLike(post.id)}
                            >
                              {likedPosts[post.id] ? (
                                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                              ) : (
                                <Heart className="w-6 h-6" />
                              )}
                            </button>
                            
                            <button 
                              className="flex items-center gap-1"
                              onClick={() => setShowComments(true)}
                            >
                              <MessageCircle className="w-6 h-6" />
                            </button>
                            
                            <button className="flex items-center gap-1">
                              <Share2 className="w-6 h-6" />
                            </button>
                          </div>
                          
                          <button onClick={() => toggleSave(post.id)}>
                            {savedPosts[post.id] ? (
                              <Bookmark className="w-6 h-6 fill-black" />
                            ) : (
                              <Bookmark className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                        
                        {/* Likes */}
                        <div className="mb-2 font-medium">12 אהבו</div>
                        
                        {/* Caption */}
                        {post.caption && (
                          <div className="mb-4">
                            <div className="flex items-start gap-2">
                              <span className="font-semibold">רגע מיוחד</span>
                              <span className="text-gray-700">{post.caption}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Comments */}
                        <div className="mb-4">
                          <button 
                            className="text-gray-500 text-sm"
                            onClick={() => setShowComments(!showComments)}
                          >
                            צפה ב-{(comments[post.id]?.length || 0) + 3} תגובות
                          </button>
                          
                          {showComments && (
                            <div className="mt-4 space-y-3">
                              {/* Static sample comments */}
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0"></div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">אורח123</span>
                                    <span className="text-gray-700 text-sm">איזה יופי של תמונה! 😍</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span>לפני 2 שעות</span>
                                    <button>הגב</button>
                                    <button>שתף</button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex-shrink-0"></div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">אורח456</span>
                                    <span className="text-gray-700 text-sm">מזל טוב! 🎉</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span>לפני 3 שעות</span>
                                    <button>הגב</button>
                                    <button>שתף</button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex-shrink-0"></div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">אורח789</span>
                                    <span className="text-gray-700 text-sm">איזה כיף לראות!</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                    <span>לפני 5 שעות</span>
                                    <button>הגב</button>
                                    <button>שתף</button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Dynamic user comments */}
                              {comments[post.id]?.map(comment => (
                                <div key={comment.id} className="flex items-start gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex-shrink-0"></div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm">{comment.username}</span>
                                      <span className="text-gray-700 text-sm">{comment.text}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      <span>כרגע</span>
                                      <button>הגב</button>
                                      <button>שתף</button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Comment Input */}
              <div className="sticky bottom-0 border-t bg-white p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex-shrink-0"></div>
                  <input
                    type="text"
                    placeholder="הוסף תגובה..."
                    className="flex-1 bg-gray-100 rounded-full py-2 px-4 text-sm focus:outline-none"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCommentSubmit(currentExpanded);
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    disabled={!commentText.trim()}
                    className={commentText.trim() ? 'text-pink-500 font-medium' : 'text-gray-300'}
                    onClick={() => handleCommentSubmit(currentExpanded)}
                  >
                    פרסם
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bottom Bar */}
      <div className="fixed bottom-0 right-0 left-0 bg-white border-t py-2">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-around">
            <button 
              className={`flex flex-col items-center p-2 ${activeView === 'feed' ? 'text-pink-600' : 'text-gray-600'}`}
              onClick={() => changeView('feed')}
            >
              <div className="relative">
                <motion.div
                  animate={activeView === 'feed' ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ImageIcon className="w-6 h-6" />
                </motion.div>
                
                {activeView === 'feed' && (
                  <motion.div 
                    className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-pink-600 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </div>
              <span className="text-xs mt-1">פיד</span>
            </button>
            
            <button 
              className={`flex flex-col items-center p-2 ${activeView === 'reels' ? 'text-pink-600' : 'text-gray-600'}`}
              onClick={() => changeView('reels')}
            >
              <div className="relative">
                <motion.div
                  animate={activeView === 'reels' ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Film className="w-6 h-6" />
                </motion.div>
                
                {activeView === 'reels' && (
                  <motion.div 
                    className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-pink-600 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </div>
              <span className="text-xs mt-1">סרטונים</span>
            </button>
            
            <div className="relative z-10">
              <button 
                className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-full p-4 -mt-6 shadow-lg"
                onClick={() => setShowCamera(true)}
              >
                <CameraIcon className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <button 
              className={`flex flex-col items-center p-2 ${activeView === 'moments' ? 'text-pink-600' : 'text-gray-600'}`}
              onClick={() => changeView('moments')}
            >
              <div className="relative">
                <motion.div
                  animate={activeView === 'moments' ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Star className="w-6 h-6" />
                </motion.div>
                
                {activeView === 'moments' && (
                  <motion.div 
                    className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-pink-600 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </div>
              <span className="text-xs mt-1">רגעים</span>
            </button>
            
            <button 
              className={`flex flex-col items-center p-2 ${activeView === 'featured' ? 'text-pink-600' : 'text-gray-600'}`}
              onClick={() => changeView('featured')}
            >
              <div className="relative">
                <motion.div
                  animate={activeView === 'featured' ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Award className="w-6 h-6" />
                </motion.div>
                
                {activeView === 'featured' && (
                  <motion.div 
                    className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-pink-600 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </div>
              <span className="text-xs mt-1">נבחרים</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCamera && (
          <SimpleCameraComponent
            onClose={() => setShowCamera(false)}
            onCapture={handleNewPost}
            eventCode={event?.code}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
