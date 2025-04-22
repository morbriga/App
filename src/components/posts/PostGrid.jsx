import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Camera, Film, Play, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PostGrid({ posts, faceTags = [], showName = false, onDeletePost = null }) {
  const [postToDelete, setPostToDelete] = React.useState(null);
  const [selectedPost, setSelectedPost] = React.useState(null);
  
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
  };
  
  const handleConfirmDelete = () => {
    if (postToDelete && onDeletePost) {
      onDeletePost(postToDelete.id);
    }
    setPostToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
        {posts.map((post, index) => {
          const postTags = showName ? faceTags.filter(tag => tag.post_id === post.id) : [];
          
          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="aspect-square relative group cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              {/* Type Badge */}
              <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {post.type === 'photo' ? (
                  <Camera className="w-4 h-4 text-white" />
                ) : (
                  <Film className="w-4 h-4 text-white" />
                )}
              </div>

              {post.type === 'photo' ? (
                <img
                  src={post.media_url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                  style={{ filter: post.filter || 'none' }}
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={post.media_url}
                    className="w-full h-full object-cover rounded-lg"
                    style={{ filter: post.filter || 'none' }}
                  />
                  {/* Video Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-6 transform group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Face Rectangles */}
              {showName && postTags.map((tag, i) => (
                <div 
                  key={i}
                  className="absolute border-2 border-purple-500 z-10"
                  style={{
                    left: `${tag.bounding_box.x * 100}%`,
                    top: `${tag.bounding_box.y * 100}%`,
                    width: `${tag.bounding_box.width * 100}%`,
                    height: `${tag.bounding_box.height * 100}%`,
                  }}
                >
                  {tag.person_name && (
                    <span className="absolute -bottom-6 left-0 right-0 bg-purple-500 text-white text-xs py-1 px-2 text-center truncate">
                      {tag.person_name}
                    </span>
                  )}
                </div>
              ))}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center">
                {post.caption && (
                  <p className="text-white text-sm p-4 text-center line-clamp-3">{post.caption}</p>
                )}
                
                {/* Interaction Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <div className="flex gap-3">
                    <button className="text-white hover:text-pink-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="text-white hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="text-white hover:text-green-500 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Delete Button */}
                  {onDeletePost && (
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(post);
                      }}
                      className="bg-red-600/80 hover:bg-red-700 text-white rounded-full opacity-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Selected Post Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-black rounded-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {selectedPost.type === 'photo' ? (
              <img
                src={selectedPost.media_url}
                alt=""
                className="w-full h-auto max-h-[80vh] object-contain"
                style={{ filter: selectedPost.filter || 'none' }}
              />
            ) : (
              <video
                src={selectedPost.media_url}
                className="w-full h-auto max-h-[80vh]"
                controls
                autoPlay
                style={{ filter: selectedPost.filter || 'none' }}
              />
            )}
            
            {/* Caption & Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              {selectedPost.caption && (
                <p className="text-white mb-4">{selectedPost.caption}</p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="text-white hover:text-pink-500 transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <button className="text-white hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                  <button className="text-white hover:text-green-500 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
                {onDeletePost && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleDeleteClick(selectedPost);
                      setSelectedPost(null);
                    }}
                    className="bg-red-600/80 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    מחק
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את התמונה או הסרטון לצמיתות. לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}